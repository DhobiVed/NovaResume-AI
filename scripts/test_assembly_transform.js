const fs = require('fs');

function transformAssemblySnippet(snippet) {
  if (!snippet) return snippet;

  // 1. Compound branch: int x = 11; int y = 19; if (x > 8 && y > 15) print(x + y); else print(y - x);
  const compoundMatch = snippet.match(/int\s+x\s*=\s*(\d+);\s*int\s+y\s*=\s*(\d+);/);
  if (compoundMatch) {
    const x = compoundMatch[1];
    const y = compoundMatch[2];
    return `; Assembly conditional branch (x = ${x}, y = ${y})
    mov eax, ${x}
    mov ebx, ${y}
    cmp eax, 8
    jle .else_block
    cmp ebx, 15
    jle .else_block
    add eax, ebx
    jmp .done
.else_block:
    sub ebx, eax
    mov eax, ebx
.done:`;
  }

  // 2. Ternary branch: int val = 38; int limit = 25; int result = (val > limit) ? val * 2 : val + 10;
  const ternaryMatch = snippet.match(/int\s+val\s*=\s*(\d+);\s*int\s+limit\s*=\s*(\d+);\s*int\s+result\s*=\s*\(val\s*>\s*limit\)\s*\?\s*val\s*\*\s*(\d+)\s*:\s*val\s*\+\s*(\d+);/);
  if (ternaryMatch) {
    const val = ternaryMatch[1];
    const limit = ternaryMatch[2];
    const mult = ternaryMatch[3];
    const add = ternaryMatch[4];
    return `; Assembly conditional branch (val = ${val}, limit = ${limit})
    mov eax, ${val}
    mov ebx, ${limit}
    cmp eax, ebx
    jle .less_or_equal
    imul eax, ${mult}
    jmp .done
.less_or_equal:
    add eax, ${add}
.done:`;
  }

  // 3. Equality branch: int val = 29; int limit = 29; if (val == limit) print(val * 2); else print(val - 4);
  const eqMatch = snippet.match(/int\s+val\s*=\s*(\d+);\s*int\s+limit\s*=\s*(\d+);\s*if\s*\(val\s*==\s*limit\)/);
  if (eqMatch) {
    const val = eqMatch[1];
    const limit = eqMatch[2];
    return `; Assembly equality branch (val = ${val}, limit = ${limit})
    mov eax, ${val}
    mov ebx, ${limit}
    cmp eax, ebx
    jne .not_equal
    shl eax, 1        ; eax = val * 2
    jmp .done
.not_equal:
    sub eax, 4        ; eax = val - 4
.done:`;
  }

  // 4. Tiered branch: int score = 85; ...
  const tieredMatch = snippet.match(/int\s+score\s*=\s*(\d+);[\s\S]*?score\s*>=\s*(\d+)[\s\S]*?score\s*>=\s*(\d+)/);
  if (tieredMatch) {
    const score = tieredMatch[1];
    const t1 = tieredMatch[2];
    const t2 = tieredMatch[3];
    return `; Assembly tiered conditional evaluation (score = ${score})
    mov eax, ${score}
    cmp eax, ${t1}
    jge .tier1
    cmp eax, ${t2}
    jge .tier2
    mov edx, 3
    jmp .done
.tier1:
    mov edx, 1
    jmp .done
.tier2:
    mov edx, 2
.done:`;
  }

  // 5. Factorial recursion: fun factorial_90(n: Int): Int = ... print(factorial_90(3));
  const factMatch = snippet.match(/factorial_?(\d+)\s*\(\s*(\d+)\s*\)/);
  if (factMatch) {
    const seed = factMatch[1];
    const n = factMatch[2];
    return `; Assembly recursive factorial (call with edi = ${n})
factorial_${seed}:
    cmp edi, 1
    jle .base_case
    push rbx
    mov ebx, edi
    dec edi
    call factorial_${seed}
    imul eax, ebx
    pop rbx
    ret
.base_case:
    mov eax, 1
    ret`;
  }

  // 6. Loop accumulation with skip
  const loopMatch = snippet.match(/int\s+sum\s*=\s*0;\s*for\s*\(int\s+i\s*=\s*1;\s*i\s*<=\s*(\d+);\s*i\+\+\)\s*\{\s*if\s*\(i\s*==\s*(\d+)\)\s*continue;\s*sum\s*\+=\s*i;\s*\}/);
  if (loopMatch) {
    const n = loopMatch[1];
    const skip = loopMatch[2];
    return `; Assembly loop accumulation (1 to ${n}, skipping ${skip})
    xor eax, eax       ; sum = 0
    mov ecx, 1         ; i = 1
.loop_start:
    cmp ecx, ${skip}
    je .skip_add
    add eax, ecx
.skip_add:
    inc ecx
    cmp ecx, ${n}
    jle .loop_start`;
  }

  // 6b. Loop even sum: if (i % 2 == 0) sum += i;
  const loopEvenMatch = snippet.match(/int\s+sum\s*=\s*0;\s*for\s*\(int\s+i\s*=\s*1;\s*i\s*<=\s*(\d+);\s*i\+\+\)\s*\{\s*if\s*\(i\s*%\s*2\s*==\s*0\)\s*sum\s*\+=\s*i;\s*\}/);
  if (loopEvenMatch) {
    const n = loopEvenMatch[1];
    return `; Assembly loop accumulation (sum of even numbers 1 to ${n})
    xor eax, eax       ; sum = 0
    mov ecx, 1         ; i = 1
.loop_start:
    test ecx, 1        ; test if odd
    jnz .skip_add
    add eax, ecx       ; sum += i
.skip_add:
    inc ecx
    cmp ecx, ${n}
    jle .loop_start`;
  }

  // 6c. Loop product: product *= i;
  const loopProdMatch = snippet.match(/int\s+product\s*=\s*1;\s*for\s*\(int\s+i\s*=\s*1;\s*i\s*<=\s*(\d+);\s*i\+\+\)\s*\{\s*product\s*\*=\s*i;\s*\}/);
  if (loopProdMatch) {
    const n = loopProdMatch[1];
    return `; Assembly loop product (1 to ${n})
    mov eax, 1         ; product = 1
    mov ecx, 1         ; i = 1
.loop_start:
    imul eax, ecx      ; product *= i
    inc ecx            ; i++
    cmp ecx, ${n}
    jle .loop_start`;
  }

  // 6d. Loop break: if (i == 3) break;
  const loopBreakMatch = snippet.match(/int\s+sum\s*=\s*0;\s*for\s*\(int\s+i\s*=\s*(\d+);\s*i\s*<=\s*(\d+);\s*i\+\+\)\s*\{\s*if\s*\(i\s*==\s*(\d+)\)\s*break;\s*sum\s*\+=\s*i;\s*\}/);
  if (loopBreakMatch) {
    const start = loopBreakMatch[1];
    const n = loopBreakMatch[2];
    const breakVal = loopBreakMatch[3];
    return `; Assembly loop with early break (start = ${start}, limit = ${n}, break at ${breakVal})
    xor eax, eax       ; sum = 0
    mov ecx, ${start}  ; i = ${start}
.loop_start:
    cmp ecx, ${breakVal}
    je .loop_break
    add eax, ecx
    inc ecx
    cmp ecx, ${n}
    jle .loop_start
.loop_break:`;
  }

  // 6e. Loop step: for (int i = 2; i <= 10; i += 2)
  const loopStepMatch = snippet.match(/int\s+sum\s*=\s*0;\s*for\s*\(int\s+i\s*=\s*(\d+);\s*i\s*<=\s*(\d+);\s*i\s*\+=\s*(\d+)\)\s*\{\s*sum\s*\+=\s*i;\s*\}/);
  if (loopStepMatch) {
    const start = loopStepMatch[1];
    const n = loopStepMatch[2];
    const step = loopStepMatch[3];
    return `; Assembly step loop (i = ${start} to ${n} step ${step})
    xor eax, eax       ; sum = 0
    mov ecx, ${start}  ; i = ${start}
.loop_start:
    add eax, ecx
    add ecx, ${step}
    cmp ecx, ${n}
    jle .loop_start`;
  }

  // 7. Solve / Arithmetic: fun solve_1() { val a = 30; val b = 4; return (a / b) + (a % b); }
  const solveMatch = snippet.match(/val\s+a\s*=\s*(\d+);[\s\S]*?val\s+b\s*=\s*(\d+);/);
  if (solveMatch) {
    const a = solveMatch[1];
    const b = solveMatch[2];
    return `; Assembly integer division & remainder (a = ${a}, b = ${b})
    mov eax, ${a}      ; dividend
    cdq
    mov ecx, ${b}      ; divisor
    idiv ecx           ; eax = a / b, edx = a % b
    add eax, edx       ; eax = (a / b) + (a % b)`;
  }

  // 8. Array evaluation: fun array_3() { val arr = [6, 11, 18, 28]; return arr[2] - arr[0]; }
  const arrMatch = snippet.match(/val\s+arr\s*=\s*\[(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\];/);
  if (arrMatch) {
    const v1 = arrMatch[1];
    const v2 = arrMatch[2];
    const v3 = arrMatch[3];
    const v4 = arrMatch[4];
    return `; Assembly array difference (arr[2] - arr[0])
section .data
    arr dd ${v1}, ${v2}, ${v3}, ${v4}
section .text
    mov eax, [arr + 8]   ; arr[2] = ${v3}
    sub eax, [arr + 0]   ; arr[0] = ${v1}`;
  }

  // 9. Stream transform: val items = [2, 4, 6]; return items.map(x => x * 3).sum();
  const streamMatch = snippet.match(/items\.map\(x\s*=>\s*x\s*\*\s*(\d+)\)\.sum\(\)/);
  if (streamMatch) {
    const mult = streamMatch[1];
    return `; Assembly vector scaling & sum (scale by ${mult})
section .data
    items dd 2, 4, 6
section .text
    xor eax, eax
    mov ecx, [items + 0]
    imul ecx, ${mult}
    add eax, ecx
    mov ecx, [items + 4]
    imul ecx, ${mult}
    add eax, ecx
    mov ecx, [items + 8]
    imul ecx, ${mult}
    add eax, ecx`;
  }

  // 10. Concurrency test
  if (snippet.includes('concurrency test')) {
    return `; Assembly atomic memory increment test
section .data
    counter dq 0
section .text
    mov rcx, 1000
.atomic_loop:
    lock inc qword [counter]
    dec rcx
    jnz .atomic_loop
    cmp qword [counter], 1000
    sete al`;
  }

  // 11. String evaluation
  if (snippet.includes('evaluation') && snippet.includes('status')) {
    return `; Assembly string status register evaluation
section .data
    status db "initialized", 0
section .text
    mov rsi, status
    cmp byte [rsi], 0
    jz .empty
    mov eax, 1         ; status verified
.empty:`;
  }

  // 12. checkState
  if (snippet.includes('checkState')) {
    return `; Assembly non-null pointer check
check_state:
    test rdi, rdi       ; test pointer argument
    setnz al            ; return 1 if non-null, 0 if null
    ret`;
  }

  return snippet;
}

const data = JSON.parse(fs.readFileSync('frontend/public/data/mcqs_100000/22_assembly_2000_mcqs.json', 'utf8'));
let converted = 0;
let unchanged = 0;
for (const q of data) {
  if (!q.codeSnippet) continue;
  const t = transformAssemblySnippet(q.codeSnippet);
  if (t !== q.codeSnippet) converted++;
  else unchanged++;
}
console.log('Final Assembly Conversion Test:');
console.log('Converted:', converted, 'Unchanged:', unchanged);
