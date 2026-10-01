import re
import hashlib
import json
from typing import Dict, Any, List, Optional, Tuple, Set

# ============================================================
# CANONICAL TOPIC MAP — All 50 Languages
# Maps user-facing topic slugs → canonical DB topic IDs
# ============================================================
CANONICAL_TOPIC_MAP = {
    # ── Java ──────────────────────────────────────────────
    "java": {
        "conditions": "conditions", "if-else": "conditions", "if_else": "conditions",
        "if": "conditions", "conditionals": "conditions", "switch": "conditions",
        "conditional-statements": "conditions",
        "loops": "loops", "while": "loops", "for": "loops", "for_loop": "loops",
        "iteration": "loops", "do-while": "loops",
        "recursion": "recursion",
        "syntax": "syntax-fundamentals", "syntax-fundamentals": "syntax-fundamentals",
        "syntax-basics": "syntax-fundamentals", "variables": "variables-datatypes",
        "datatypes": "variables-datatypes", "data-types": "variables-datatypes",
        "operators": "operators",
        "strings": "strings",
        "arrays": "arrays",
        "methods": "methods", "functions": "methods",
        "classes": "classes-objects", "oop": "classes-objects", "classes-objects": "classes-objects",
        "inheritance": "inheritance", "polymorphism": "polymorphism",
        "abstraction": "abstraction", "interfaces": "interfaces",
        "exceptions": "exceptions", "exception-handling": "exceptions",
        "collections": "collections",
        "generics": "generics",
        "threads": "threads-concurrency", "concurrency": "threads-concurrency",
        "threads-concurrency": "threads-concurrency",
        "io": "file-io", "file-io": "file-io",
        "jvm": "jvm-architecture", "jvm-architecture": "jvm-architecture",
        "algorithms": "algorithms", "data-structures": "data-structures",
        "lambda": "lambda-streams", "streams": "lambda-streams",
    },
    # ── Python ────────────────────────────────────────────
    "python": {
        "conditions": "conditionals", "if-else": "conditionals", "if_else": "conditionals",
        "if": "conditionals", "conditionals": "conditionals", "conditional-statements": "conditionals",
        "loops": "loops", "for": "loops", "while": "loops", "iteration": "loops",
        "recursion": "recursion",
        "functions": "functions",
        "syntax": "syntax-intro", "syntax-intro": "syntax-intro",
        "syntax-fundamentals": "syntax-intro", "syntax-basics": "syntax-intro",
        "variables": "variables", "datatypes": "variables", "data-types": "variables",
        "operators": "operators",
        "strings": "strings",
        "lists": "lists-tuples", "tuples": "lists-tuples", "lists-tuples": "lists-tuples",
        "dictionaries": "dictionaries-sets", "sets": "dictionaries-sets",
        "dictionaries-sets": "dictionaries-sets",
        "oop": "classes-objects", "classes": "classes-objects", "classes-objects": "classes-objects",
        "inheritance": "inheritance",
        "exceptions": "exceptions", "exception-handling": "exceptions",
        "modules": "modules-packages", "packages": "modules-packages",
        "file-io": "file-io", "io": "file-io",
        "algorithms": "algorithms", "data-structures": "data-structures",
        "comprehensions": "comprehensions", "generators": "generators",
        "decorators": "decorators", "lambda": "lambda",
        "concurrency": "concurrency", "threads": "concurrency",
    },
    # ── JavaScript ───────────────────────────────────────
    "javascript": {
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "conditional-statements": "conditions",
        "loops": "loops", "for": "loops", "while": "loops", "iteration": "loops",
        "recursion": "recursion",
        "functions": "functions", "arrow-functions": "functions",
        "syntax": "syntax-fundamentals", "syntax-fundamentals": "syntax-fundamentals",
        "syntax-basics": "syntax-fundamentals", "variables": "variables",
        "datatypes": "variables", "data-types": "variables",
        "operators": "operators",
        "strings": "strings",
        "arrays": "arrays", "array-methods": "arrays",
        "objects": "objects", "classes": "classes-objects", "classes-objects": "classes-objects",
        "oop": "classes-objects",
        "inheritance": "inheritance",
        "exceptions": "exceptions", "exception-handling": "exceptions",
        "promises": "promises-async", "async-await": "promises-async",
        "promises-async": "promises-async",
        "closures": "closures", "scope": "closures",
        "dom": "dom", "events": "dom",
        "modules": "modules", "es6": "modules",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── TypeScript ───────────────────────────────────────
    "typescript": {
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "conditional-statements": "conditions",
        "loops": "loops", "for": "loops", "while": "loops", "iteration": "loops",
        "recursion": "recursion",
        "functions": "functions",
        "syntax": "syntax-fundamentals", "syntax-fundamentals": "syntax-fundamentals",
        "variables": "variables", "datatypes": "variables", "data-types": "variables",
        "operators": "operators",
        "strings": "strings",
        "arrays": "arrays",
        "interfaces": "interfaces", "types": "types",
        "generics": "generics",
        "classes": "classes-objects", "oop": "classes-objects", "classes-objects": "classes-objects",
        "inheritance": "inheritance",
        "exceptions": "exceptions", "exception-handling": "exceptions",
        "promises": "promises-async", "async-await": "promises-async",
        "modules": "modules",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── C++ ──────────────────────────────────────────────
    "cpp": {
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "conditional-statements": "conditions",
        "loops": "loops", "for": "loops", "while": "loops", "iteration": "loops",
        "recursion": "recursion",
        "functions": "functions",
        "syntax": "syntax-fundamentals", "syntax-fundamentals": "syntax-fundamentals",
        "variables": "variables-datatypes", "datatypes": "variables-datatypes",
        "operators": "operators",
        "strings": "strings",
        "arrays": "arrays", "vectors": "arrays",
        "pointers": "pointers-memory", "references": "pointers-memory",
        "pointers-memory": "pointers-memory",
        "classes": "classes-objects", "oop": "classes-objects", "classes-objects": "classes-objects",
        "inheritance": "inheritance", "polymorphism": "polymorphism",
        "templates": "templates", "generics": "templates",
        "stl": "stl", "standard-library": "stl",
        "exceptions": "exceptions", "exception-handling": "exceptions",
        "memory": "memory-management", "memory-management": "memory-management",
        "concurrency": "concurrency", "threads": "concurrency",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── C# ───────────────────────────────────────────────
    "csharp": {
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "conditional-statements": "conditions",
        "loops": "loops", "for": "loops", "while": "loops", "iteration": "loops",
        "recursion": "recursion",
        "functions": "methods", "methods": "methods",
        "syntax": "syntax-fundamentals", "syntax-fundamentals": "syntax-fundamentals",
        "variables": "variables-datatypes", "datatypes": "variables-datatypes",
        "operators": "operators",
        "strings": "strings",
        "arrays": "arrays", "collections": "collections",
        "classes": "classes-objects", "oop": "classes-objects", "classes-objects": "classes-objects",
        "inheritance": "inheritance", "polymorphism": "polymorphism",
        "interfaces": "interfaces",
        "generics": "generics",
        "exceptions": "exceptions", "exception-handling": "exceptions",
        "linq": "linq", "lambda": "linq",
        "async-await": "async-await", "concurrency": "concurrency",
        "memory": "memory-management", "memory-management": "memory-management",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── Go / Golang ───────────────────────────────────────
    "golang": {
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "conditional-statements": "conditions",
        "loops": "loops", "for": "loops", "while": "loops", "iteration": "loops",
        "recursion": "recursion",
        "functions": "functions",
        "syntax": "syntax-fundamentals", "syntax-fundamentals": "syntax-fundamentals",
        "variables": "variables", "datatypes": "variables",
        "operators": "operators",
        "strings": "strings",
        "arrays": "arrays", "slices": "arrays",
        "structs": "structs-interfaces", "interfaces": "structs-interfaces",
        "goroutines": "concurrency", "channels": "concurrency", "concurrency": "concurrency",
        "exceptions": "exceptions", "error-handling": "exceptions",
        "memory": "memory-management", "pointers": "memory-management",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    "go": {  # alias
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "loops": "loops", "for": "loops", "while": "loops",
        "recursion": "recursion", "functions": "functions",
        "syntax": "syntax-fundamentals", "variables": "variables",
        "strings": "strings", "arrays": "arrays", "slices": "arrays",
        "structs": "structs-interfaces", "interfaces": "structs-interfaces",
        "goroutines": "concurrency", "channels": "concurrency", "concurrency": "concurrency",
        "exceptions": "exceptions", "error-handling": "exceptions",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── Rust ─────────────────────────────────────────────
    "rust": {
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "conditional-statements": "conditions",
        "loops": "loops", "for": "loops", "while": "loops", "iteration": "loops",
        "recursion": "recursion",
        "functions": "functions",
        "syntax": "syntax-fundamentals", "syntax-fundamentals": "syntax-fundamentals",
        "variables": "variables", "datatypes": "variables",
        "operators": "operators",
        "strings": "strings",
        "arrays": "arrays", "vectors": "arrays",
        "structs": "structs-traits", "traits": "structs-traits", "structs-traits": "structs-traits",
        "ownership": "ownership-borrowing", "borrowing": "ownership-borrowing",
        "ownership-borrowing": "ownership-borrowing",
        "enums": "enums",
        "generics": "generics",
        "exceptions": "exceptions", "error-handling": "exceptions",
        "concurrency": "concurrency", "threads": "concurrency",
        "memory": "memory-management", "memory-management": "memory-management",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── Swift ────────────────────────────────────────────
    "swift": {
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "conditional-statements": "conditions",
        "loops": "loops", "for": "loops", "while": "loops", "iteration": "loops",
        "recursion": "recursion",
        "functions": "functions",
        "syntax": "syntax-fundamentals", "syntax-fundamentals": "syntax-fundamentals",
        "variables": "variables", "datatypes": "variables",
        "operators": "operators",
        "strings": "strings",
        "arrays": "arrays", "collections": "collections",
        "classes": "classes-objects", "structs": "classes-objects", "classes-objects": "classes-objects",
        "inheritance": "inheritance", "protocols": "protocols",
        "optionals": "optionals",
        "closures": "closures",
        "generics": "generics",
        "exceptions": "exceptions", "error-handling": "exceptions",
        "concurrency": "concurrency", "async-await": "concurrency",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── Kotlin ───────────────────────────────────────────
    "kotlin": {
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "conditional-statements": "conditions",
        "loops": "loops", "for": "loops", "while": "loops", "iteration": "loops",
        "recursion": "recursion",
        "functions": "functions",
        "syntax": "syntax-fundamentals", "syntax-fundamentals": "syntax-fundamentals",
        "variables": "variables", "datatypes": "variables",
        "operators": "operators",
        "strings": "strings",
        "arrays": "arrays", "collections": "collections",
        "classes": "classes-objects", "oop": "classes-objects", "classes-objects": "classes-objects",
        "inheritance": "inheritance", "interfaces": "interfaces",
        "generics": "generics",
        "exceptions": "exceptions", "exception-handling": "exceptions",
        "coroutines": "coroutines", "concurrency": "coroutines",
        "lambda": "lambda", "higher-order": "lambda",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── PHP ──────────────────────────────────────────────
    "php": {
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "conditional-statements": "conditions",
        "loops": "loops", "for": "loops", "while": "loops", "iteration": "loops",
        "recursion": "recursion",
        "functions": "functions",
        "syntax": "syntax-fundamentals", "syntax-fundamentals": "syntax-fundamentals",
        "variables": "variables", "datatypes": "variables",
        "operators": "operators",
        "strings": "strings",
        "arrays": "arrays",
        "classes": "classes-objects", "oop": "classes-objects", "classes-objects": "classes-objects",
        "inheritance": "inheritance", "interfaces": "interfaces",
        "exceptions": "exceptions", "exception-handling": "exceptions",
        "sessions": "sessions-cookies", "cookies": "sessions-cookies",
        "database": "database", "mysql": "database",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── Ruby ─────────────────────────────────────────────
    "ruby": {
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "conditional-statements": "conditions",
        "loops": "loops", "for": "loops", "while": "loops", "iteration": "loops",
        "each": "loops",
        "recursion": "recursion",
        "functions": "methods", "methods": "methods",
        "syntax": "syntax-fundamentals", "syntax-fundamentals": "syntax-fundamentals",
        "variables": "variables", "datatypes": "variables",
        "operators": "operators",
        "strings": "strings",
        "arrays": "arrays", "hashes": "hashes",
        "classes": "classes-objects", "oop": "classes-objects", "classes-objects": "classes-objects",
        "inheritance": "inheritance", "modules": "modules",
        "blocks": "blocks-procs-lambdas", "procs": "blocks-procs-lambdas",
        "exceptions": "exceptions", "exception-handling": "exceptions",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── C ────────────────────────────────────────────────
    "c": {
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "conditional-statements": "conditions",
        "loops": "loops", "for": "loops", "while": "loops", "iteration": "loops",
        "recursion": "recursion",
        "functions": "functions",
        "syntax": "syntax-fundamentals", "syntax-fundamentals": "syntax-fundamentals",
        "variables": "variables", "datatypes": "variables",
        "operators": "operators",
        "strings": "strings", "arrays": "arrays",
        "pointers": "pointers-memory", "memory": "pointers-memory",
        "structs": "structs", "unions": "structs",
        "exceptions": "exceptions", "error-handling": "exceptions",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── Dart ─────────────────────────────────────────────
    "dart": {
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "conditional-statements": "conditions",
        "loops": "loops", "for": "loops", "while": "loops", "iteration": "loops",
        "recursion": "recursion",
        "functions": "functions",
        "syntax": "syntax-fundamentals", "syntax-fundamentals": "syntax-fundamentals",
        "variables": "variables", "datatypes": "variables",
        "operators": "operators",
        "strings": "strings", "arrays": "arrays", "lists": "arrays",
        "classes": "classes-objects", "oop": "classes-objects",
        "inheritance": "inheritance", "mixins": "mixins",
        "exceptions": "exceptions", "error-handling": "exceptions",
        "async-await": "async-await", "futures": "async-await",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── Bash / Shell ─────────────────────────────────────
    "bash": {
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "conditional-statements": "conditions",
        "loops": "loops", "for": "loops", "while": "loops",
        "recursion": "recursion",
        "functions": "functions",
        "syntax": "syntax-fundamentals", "syntax-fundamentals": "syntax-fundamentals",
        "variables": "variables",
        "strings": "strings", "arrays": "arrays",
        "file-io": "file-io", "io": "file-io",
        "scripts": "scripting", "scripting": "scripting",
        "algorithms": "algorithms",
    },
    # ── Scala ────────────────────────────────────────────
    "scala": {
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "conditional-statements": "conditions",
        "loops": "loops", "for": "loops", "while": "loops",
        "recursion": "recursion",
        "functions": "functions",
        "syntax": "syntax-fundamentals", "syntax-fundamentals": "syntax-fundamentals",
        "variables": "variables",
        "strings": "strings", "arrays": "arrays", "lists": "arrays",
        "classes": "classes-objects", "oop": "classes-objects",
        "traits": "traits",
        "pattern-matching": "pattern-matching",
        "higher-order": "higher-order-functions", "lambda": "higher-order-functions",
        "exceptions": "exceptions", "error-handling": "exceptions",
        "concurrency": "concurrency", "actors": "concurrency",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── R ────────────────────────────────────────────────
    "r": {
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "loops": "loops", "for": "loops", "while": "loops",
        "recursion": "recursion",
        "functions": "functions",
        "syntax": "syntax-fundamentals", "syntax-fundamentals": "syntax-fundamentals",
        "variables": "variables",
        "vectors": "vectors", "arrays": "vectors",
        "dataframes": "dataframes",
        "strings": "strings",
        "exceptions": "exceptions", "error-handling": "exceptions",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── Haskell ───────────────────────────────────────────
    "haskell": {
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "loops": "loops", "recursion": "recursion",
        "functions": "functions",
        "syntax": "syntax-fundamentals", "syntax-fundamentals": "syntax-fundamentals",
        "types": "types", "typeclasses": "typeclasses",
        "monads": "monads",
        "pattern-matching": "pattern-matching",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── Lua ───────────────────────────────────────────────
    "lua": {
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "loops": "loops", "for": "loops", "while": "loops",
        "recursion": "recursion", "functions": "functions",
        "syntax": "syntax-fundamentals", "variables": "variables",
        "strings": "strings", "tables": "tables",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── Perl ──────────────────────────────────────────────
    "perl": {
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "loops": "loops", "for": "loops", "while": "loops",
        "recursion": "recursion", "functions": "functions",
        "syntax": "syntax-fundamentals", "variables": "variables",
        "strings": "strings", "arrays": "arrays", "hashes": "hashes",
        "regex": "regex", "regular-expressions": "regex",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── SQL ───────────────────────────────────────────────
    "sql": {
        "conditions": "conditions", "where": "conditions",
        "loops": "loops", "cursors": "loops",
        "functions": "functions", "aggregates": "functions",
        "syntax": "syntax-fundamentals", "syntax-fundamentals": "syntax-fundamentals",
        "select": "select-queries", "queries": "select-queries",
        "joins": "joins", "subqueries": "subqueries",
        "tables": "tables", "ddl": "tables",
        "indexes": "indexes",
        "transactions": "transactions",
        "procedures": "stored-procedures",
        "algorithms": "algorithms",
    },
    # ── HTML ──────────────────────────────────────────────
    "html": {
        "syntax": "syntax-fundamentals", "syntax-fundamentals": "syntax-fundamentals",
        "tags": "tags-elements", "elements": "tags-elements",
        "forms": "forms", "inputs": "forms",
        "tables": "tables", "lists": "lists",
        "semantic": "semantic-html",
        "media": "multimedia",
        "links": "links-navigation",
        "conditions": "conditions",
    },
    # ── CSS ───────────────────────────────────────────────
    "css": {
        "syntax": "syntax-fundamentals", "syntax-fundamentals": "syntax-fundamentals",
        "selectors": "selectors",
        "box-model": "box-model",
        "flexbox": "flexbox",
        "grid": "css-grid",
        "positioning": "positioning",
        "responsive": "responsive-design",
        "animations": "animations",
        "conditions": "conditions",
    },
    # ── Assembly ──────────────────────────────────────────
    "assembly": {
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "loops": "loops", "recursion": "recursion",
        "functions": "functions", "procedures": "functions",
        "syntax": "syntax-fundamentals", "variables": "variables",
        "registers": "registers", "memory": "memory-addressing",
        "algorithms": "algorithms",
    },
    # ── Groovy ────────────────────────────────────────────
    "groovy": {
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "loops": "loops", "for": "loops", "while": "loops",
        "recursion": "recursion", "functions": "functions", "closures": "closures",
        "syntax": "syntax-fundamentals", "variables": "variables",
        "strings": "strings", "lists": "arrays", "maps": "maps",
        "classes": "classes-objects", "oop": "classes-objects",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── Elixir ────────────────────────────────────────────
    "elixir": {
        "conditions": "conditions", "if-else": "conditions", "conditionals": "conditions",
        "loops": "loops", "recursion": "recursion",
        "functions": "functions",
        "syntax": "syntax-fundamentals", "variables": "variables",
        "pattern-matching": "pattern-matching",
        "processes": "concurrency", "concurrency": "concurrency",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── Erlang ────────────────────────────────────────────
    "erlang": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "recursion": "recursion",
        "functions": "functions",
        "syntax": "syntax-fundamentals", "variables": "variables",
        "processes": "concurrency", "concurrency": "concurrency",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── Julia ─────────────────────────────────────────────
    "julia": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "for": "loops", "while": "loops",
        "recursion": "recursion", "functions": "functions",
        "syntax": "syntax-fundamentals", "variables": "variables",
        "types": "types",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── Matlab ────────────────────────────────────────────
    "matlab": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "for": "loops", "while": "loops",
        "recursion": "recursion", "functions": "functions",
        "syntax": "syntax-fundamentals", "variables": "variables",
        "matrices": "matrices", "arrays": "matrices",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── Powershell ────────────────────────────────────────
    "powershell": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "for": "loops", "while": "loops",
        "recursion": "recursion", "functions": "functions",
        "syntax": "syntax-fundamentals", "variables": "variables",
        "strings": "strings", "arrays": "arrays",
        "scripts": "scripting", "algorithms": "algorithms",
    },
    # ── Objective-C ───────────────────────────────────────
    "objective-c": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "for": "loops", "while": "loops",
        "recursion": "recursion", "functions": "functions", "methods": "methods",
        "syntax": "syntax-fundamentals", "variables": "variables",
        "strings": "strings", "arrays": "arrays",
        "classes": "classes-objects", "oop": "classes-objects",
        "exceptions": "exceptions", "memory": "memory-management",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── Clojure ───────────────────────────────────────────
    "clojure": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "recursion": "recursion",
        "functions": "functions",
        "syntax": "syntax-fundamentals", "variables": "variables",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── Lisp ──────────────────────────────────────────────
    "lisp": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "recursion": "recursion",
        "functions": "functions",
        "syntax": "syntax-fundamentals",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── OCaml ─────────────────────────────────────────────
    "ocaml": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "recursion": "recursion",
        "functions": "functions",
        "syntax": "syntax-fundamentals", "types": "types",
        "pattern-matching": "pattern-matching",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── F# ────────────────────────────────────────────────
    "fsharp": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "recursion": "recursion",
        "functions": "functions",
        "syntax": "syntax-fundamentals", "types": "types",
        "pattern-matching": "pattern-matching",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── Prolog ────────────────────────────────────────────
    "prolog": {
        "conditions": "conditions",
        "recursion": "recursion", "loops": "loops",
        "functions": "predicates", "predicates": "predicates",
        "syntax": "syntax-fundamentals",
        "algorithms": "algorithms",
    },
    # ── Crystal ───────────────────────────────────────────
    "crystal": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "for": "loops", "while": "loops",
        "recursion": "recursion", "functions": "functions",
        "syntax": "syntax-fundamentals", "variables": "variables",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── Nim ───────────────────────────────────────────────
    "nim": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "for": "loops", "while": "loops",
        "recursion": "recursion", "functions": "functions",
        "syntax": "syntax-fundamentals", "variables": "variables",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── Zig ───────────────────────────────────────────────
    "zig": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "for": "loops", "while": "loops",
        "recursion": "recursion", "functions": "functions",
        "syntax": "syntax-fundamentals", "variables": "variables",
        "memory": "memory-management",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── D ─────────────────────────────────────────────────
    "d": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "for": "loops", "while": "loops",
        "recursion": "recursion", "functions": "functions",
        "syntax": "syntax-fundamentals", "variables": "variables",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── V ─────────────────────────────────────────────────
    "v": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "for": "loops", "while": "loops",
        "recursion": "recursion", "functions": "functions",
        "syntax": "syntax-fundamentals",
        "algorithms": "algorithms",
    },
    # ── CUDA ──────────────────────────────────────────────
    "cuda": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "for": "loops", "while": "loops",
        "recursion": "recursion", "functions": "functions",
        "syntax": "syntax-fundamentals",
        "concurrency": "concurrency", "algorithms": "algorithms",
    },
    # ── Ada ───────────────────────────────────────────────
    "ada": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "for": "loops", "while": "loops",
        "recursion": "recursion", "functions": "functions",
        "syntax": "syntax-fundamentals", "variables": "variables",
        "exceptions": "exceptions",
        "algorithms": "algorithms", "data-structures": "data-structures",
    },
    # ── Apex ──────────────────────────────────────────────
    "apex": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "for": "loops", "while": "loops",
        "recursion": "recursion", "functions": "functions",
        "syntax": "syntax-fundamentals",
        "classes": "classes-objects", "soql": "soql",
        "exceptions": "exceptions",
        "algorithms": "algorithms",
    },
    # ── COBOL ─────────────────────────────────────────────
    "cobol": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "perform": "loops",
        "recursion": "recursion", "functions": "functions",
        "syntax": "syntax-fundamentals", "variables": "variables",
        "algorithms": "algorithms",
    },
    # ── Fortran ───────────────────────────────────────────
    "fortran": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "do": "loops",
        "recursion": "recursion", "functions": "functions",
        "syntax": "syntax-fundamentals", "variables": "variables",
        "arrays": "arrays",
        "algorithms": "algorithms",
    },
    # ── Solidity ──────────────────────────────────────────
    "solidity": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "for": "loops", "while": "loops",
        "recursion": "recursion", "functions": "functions",
        "syntax": "syntax-fundamentals",
        "contracts": "smart-contracts",
        "algorithms": "algorithms",
    },
    # ── PL/SQL ────────────────────────────────────────────
    "plsql": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "cursors": "loops",
        "recursion": "recursion", "functions": "functions", "procedures": "procedures",
        "syntax": "syntax-fundamentals",
        "algorithms": "algorithms",
    },
    # ── T-SQL ─────────────────────────────────────────────
    "tsql": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "cursors": "loops",
        "recursion": "recursion", "functions": "functions", "procedures": "procedures",
        "syntax": "syntax-fundamentals",
        "algorithms": "algorithms",
    },
    # ── Visual Basic ──────────────────────────────────────
    "visual-basic": {
        "conditions": "conditions", "if-else": "conditions",
        "loops": "loops", "for": "loops", "while": "loops",
        "recursion": "recursion", "functions": "functions", "subs": "functions",
        "syntax": "syntax-fundamentals", "variables": "variables",
        "algorithms": "algorithms",
    },
}

# ============================================================
# Broad topic → fine-grained topic keyword map
# Used during reclassification of legacy broad topic IDs
# ============================================================
BROAD_TOPIC_SPLIT_MAP = {
    "syntax_basics": {
        "primary_concepts": ["syntax-fundamentals", "variables-datatypes", "operators"],
        "default": "syntax-fundamentals"
    },
    "control_flow": {
        "primary_concepts": ["conditions", "loops", "recursion"],
        "default": "control_flow"
    },
    "functions_scope": {
        "primary_concepts": ["functions", "methods", "recursion", "closures"],
        "default": "functions"
    },
    "functions_async": {  # JS-specific
        "primary_concepts": ["functions", "promises-async", "closures"],
        "default": "functions"
    },
    "data_structures": {
        "primary_concepts": ["arrays", "data-structures", "strings", "collections"],
        "default": "data-structures"
    },
    "objects_arrays": {  # JS-specific
        "primary_concepts": ["arrays", "objects", "data-structures", "classes-objects"],
        "default": "arrays"
    },
    "oop_abstractions": {
        "primary_concepts": ["classes-objects", "inheritance", "polymorphism", "interfaces", "abstraction"],
        "default": "classes-objects"
    },
    "error_handling": {
        "primary_concepts": ["exceptions", "error-handling"],
        "default": "exceptions"
    },
    "memory_management": {
        "primary_concepts": ["memory-management", "pointers-memory"],
        "default": "memory-management"
    },
    "concurrency_async": {
        "primary_concepts": ["concurrency", "threads-concurrency", "async-await", "goroutines"],
        "default": "concurrency"
    },
    "io_filesystem": {
        "primary_concepts": ["file-io", "io"],
        "default": "file-io"
    },
    "advanced_features": {
        "primary_concepts": ["generics", "lambda", "templates", "decorators", "meta-programming"],
        "default": "advanced-features"
    },
    "syntax_dom": {
        "primary_concepts": ["syntax-fundamentals", "dom"],
        "default": "syntax-fundamentals"
    },
    "storage_apis": {
        "primary_concepts": ["sessions-cookies", "file-io", "storage"],
        "default": "storage"
    },
    "security_validation": {
        "primary_concepts": ["security"],
        "default": "security"
    },
    "modules_tooling": {
        "primary_concepts": ["modules", "build-tools"],
        "default": "modules"
    },
    "events_loop": {
        "primary_concepts": ["dom", "event-loop", "concurrency"],
        "default": "event-loop"
    },
    "error_debugging": {
        "primary_concepts": ["exceptions", "debugging"],
        "default": "exceptions"
    },
    "advanced_patterns": {
        "primary_concepts": ["design-patterns", "advanced-features"],
        "default": "advanced-features"
    },
}


class QuestionClassifier:
    """
    Authoritative Semantic Classifier, Negative Topic Validator, and Multi-Layer Deduplicator.
    Language-agnostic: correctly handles Python, Go, Rust, Ruby, Haskell and all other 50 languages.
    """

    @staticmethod
    def normalize_text(text: str) -> str:
        """Strip punctuation, lowercase, collapse whitespace."""
        if not text:
            return ""
        clean = re.sub(r'[`\'""]', "", text.lower())
        clean = re.sub(r"[^a-z0-9\s]", " ", clean)
        return " ".join(clean.split())

    @staticmethod
    def normalize_code_snippet(code: str) -> str:
        """Normalize code to detect structural problem templates."""
        if not code:
            return ""
        lines = []
        for line in code.splitlines():
            stripped = line.strip()
            stripped = re.sub(r"//.*$", "", stripped)
            stripped = re.sub(r"#.*$", "", stripped)
            if stripped:
                lines.append(stripped)
        joined = " ".join(lines).lower()
        tokenized = re.sub(
            r"\b(var|let|const|int|float|double|String|boolean|bool|char)\s+([a-zA-Z_0-9]+)",
            r"\1 VAR", joined
        )
        return re.sub(r"\s+", " ", tokenized).strip()

    @staticmethod
    def detect_constructs(text: str, code: str, language: str) -> Dict[str, Any]:
        """
        Inspects code and text to extract active programming constructs.
        LANGUAGE-AGNOSTIC: handles Java/C/JS (parenthesized for), Python/Go/Rust (non-parenthesized for),
        Ruby (.each/.times), Haskell (map/foldr), COBOL (PERFORM), Fortran (DO loops), etc.
        """
        combined = f"{text or ''} \n {code or ''}".lower()
        code_only = (code or "").lower()
        lang = (language or "").lower().strip()

        # ── CONDITIONAL ─────────────────────────────────────
        has_if = bool(
            re.search(r"\bif\s*\(", code_only) or               # Java/C/C#/JS
            re.search(r"\bif\s+[\w\d\"'(]", code_only) or        # Python/Ruby: if x, if (
            re.search(r"\belif\b|\belsif\b", code_only) or        # Python elif, Ruby elsif
            re.search(r"\bwhen\s+[\w\d]", code_only) or           # Ruby case/when
            re.search(r"\bguard\s+\w", code_only) or              # Swift guard
            re.search(r"\bmatch\s+\w.*\{", code_only) or          # Rust match
            re.search(r"\bif\s*$", code_only, re.MULTILINE)        # bare if
        )
        has_else = bool(re.search(r"\belse\b", code_only))
        has_switch = bool(
            re.search(r"\bswitch\s*\(", code_only) or
            re.search(r"\bcase\s+[\w\d'\"]+\s*:", code_only) or
            re.search(r"\bcase\s+\w+\s*=>", code_only)             # Scala/Kotlin match
        )
        has_ternary = bool(re.search(r"\?\s*[^:]+\s*:", code_only))
        is_conditional = has_if or has_else or has_switch or has_ternary

        # ── LOOP ─────────────────────────────────────────────
        # Parenthesized for: Java/C/C#/JS/PHP — for(
        has_for_paren = bool(re.search(r"\bfor\s*\(", code_only))
        # Non-parenthesized for: Python, Go, Rust, Swift, Kotlin — for x in ...
        has_for_in = bool(re.search(r"\bfor\s+[\w_,\s]+\s+in\b", code_only))
        # Go for loops: for i := ..., for _, v := range ..., for { (infinite), for range
        has_for_go = bool(
            re.search(r"\bfor\s+[\w_]+\s*:=", code_only) or       # for i :=
            re.search(r"\bfor\s+[\w_]+,\s*[\w_]+\s*:=", code_only) or  # for k, v :=
            re.search(r"\brange\s+\w", code_only) or               # range slice/map
            re.search(r"\bfor\s*\{", code_only)                    # infinite for {
        )
        # Ruby iterators: .each, .times, .upto, .downto, .map, .each_with_index
        has_ruby_iter = bool(re.search(r"\.(each|times|upto|downto|step|map)\s*(\{|\bdo\b)", code_only))
        # Functional loops: map/filter/reduce/fold (Haskell, Scala, F#, etc.)
        has_functional = bool(re.search(r"\b(map|filter|reduce|fold[lr]?|forEach|forM|mapM)\s*[\(\w]", code_only))
        # COBOL PERFORM loop
        has_cobol_perform = bool(re.search(r"\bperform\s+\w+\s+(times|until|varying)\b", code_only))
        # Fortran DO loop
        has_fortran_do = bool(re.search(r"\bdo\s+\w+\s*=\s*\d+\s*,\s*\d+", code_only))
        # Assembly loop (JMP/JNZ/LOOP)
        has_asm_loop = bool(re.search(r"\bjmp\b|\bjnz\b|\bjne\b|\bloop\b", code_only) and
                            re.search(r"\b(label|section|proc|endp|ret)\b", code_only))

        has_for = has_for_paren or has_for_in or has_for_go
        has_while = bool(
            re.search(r"\bwhile\s*\(", code_only) or
            re.search(r"\bwhile\s+[\w\d(\"']", code_only) or       # Python/Ruby while cond
            re.search(r"\buntil\s+[\w\d(\"']", code_only) or        # Ruby until
            re.search(r"\bloop\s*\{", code_only)                     # Rust loop {}
        )
        has_do_while = bool(re.search(r"\bdo\s*\{", code_only))
        is_loop = (has_for or has_while or has_do_while or
                   has_ruby_iter or has_functional or
                   has_cobol_perform or has_fortran_do or has_asm_loop)

        # ── RECURSION ──────────────────────────────────────
        has_recursion = bool(
            re.search(r"\brecursiv|\brecursion|\bfactorial|\bfibonacci\b|\bhanoi\b|\bmerge.sort\b", combined) or
            re.search(r"(\w+)\s*\([^)]*\)\s*\{[^}]*\b\1\s*\(", code_only)  # func calls itself
        )

        # ── OOP / CLASSES ──────────────────────────────────
        has_array = bool(re.search(r"\[\s*\]|\barray\b|\blist\b|\bvector\b|\bslice\b|\bmatrix\b", combined))
        has_class_oop = bool(re.search(
            r"\bclass\s+[a-zA-Z0-9_]+|\binterface\b|\bextends\b|\bimplements\b|\bprotocol\b|\btrait\b|\bmixin\b",
            combined
        ))
        has_exception = bool(re.search(
            r"\btry\s*\{|\bcatch\b|\bthrow[s]?\b|\bexcept\b|\bfinally\b|\bexception\b|\braise\b|\brescue\b",
            combined
        ))
        has_jvm_arch = bool(re.search(
            r"\bjvm\b|\bbytecode\b|\bgarbage collect|\bheap\b|\bstack memory\b|\bclassloader\b",
            combined
        ))
        has_ds_algo = bool(re.search(
            r"\btime complexity\b|\blinear search\b|\bbinary search\b|\bstack\b|\bqueue\b|\bfifo\b",
            combined
        ))
        has_threads = bool(re.search(
            r"\bthread\b|\bsynchronized\b|\bdeadlock\b|\bvolatile\b|\bconcurrency\b|\bgoroutine\b|\bcoroutine\b|\basync\b",
            combined
        ))
        has_collections = bool(re.search(
            r"\bhashmap\b|\barraylist\b|\blinkedlist\b|\bhashset\b|\btreeset\b|\bcollections?\b|\bdict\b|\bmap\s*<\b",
            combined
        ))

        return {
            "has_if": has_if,
            "has_else": has_else,
            "has_switch": has_switch,
            "has_ternary": has_ternary,
            "is_conditional": is_conditional,
            "has_for": has_for,
            "has_while": has_while,
            "has_do_while": has_do_while,
            "has_ruby_iter": has_ruby_iter,
            "has_functional": has_functional,
            "is_loop": is_loop,
            "has_recursion": has_recursion,
            "has_array": has_array,
            "has_class_oop": has_class_oop,
            "has_exception": has_exception,
            "has_jvm_arch": has_jvm_arch,
            "has_ds_algo": has_ds_algo,
            "has_threads": has_threads,
            "has_collections": has_collections,
        }

    @staticmethod
    def determine_primary_concept(
        language: str,
        topic_id: str,
        question_text: str,
        code_snippet: str
    ) -> Tuple[str, List[str], str, float]:
        """
        Determines the single authoritative primaryConcept, secondaryConcepts,
        canonical topic_id, and confidence score.
        Priority (high → low):
          JVM Architecture > DS/Algo > Exception > Thread > Recursion > Loop > Conditional > OOP > Array > fallback
        """
        lang = (language or "general").lower().strip()
        constructs = QuestionClassifier.detect_constructs(question_text, code_snippet, lang)
        q_lower = (question_text or "").lower()
        secondaries: List[str] = []
        canonical_topic = topic_id

        if constructs["has_jvm_arch"]:
            return f"{lang}-jvm-architecture", ["architecture"], "jvm-architecture", 98.0

        if constructs["has_ds_algo"]:
            return f"{lang}-algorithms-complexity", ["complexity"], "algorithms", 95.0

        if constructs["has_exception"] and not constructs["is_conditional"]:
            return f"{lang}-exceptions", ["error-handling"], "exceptions", 95.0

        if constructs["has_threads"] and not constructs["is_conditional"]:
            return f"{lang}-threads-concurrency", ["concurrency"], "threads-concurrency", 95.0

        if constructs["has_recursion"]:
            primary = f"{lang}-recursion"
            canonical_topic = "recursion"
            if constructs["is_conditional"]:
                secondaries.append(f"{lang}-conditional-branching")
            return primary, secondaries, canonical_topic, 96.0

        # Loops take priority over conditionals
        if constructs["is_loop"]:
            if constructs["has_for"]:
                primary = f"{lang}-for-loop"
            elif constructs["has_do_while"]:
                primary = f"{lang}-do-while-loop"
            elif constructs.get("has_ruby_iter"):
                primary = f"{lang}-iterator-loop"
            elif constructs.get("has_functional"):
                primary = f"{lang}-functional-iteration"
            else:
                primary = f"{lang}-while-loop"
            canonical_topic = "loops"
            if constructs["is_conditional"]:
                secondaries.append(f"{lang}-conditional-branching")
            return primary, secondaries, canonical_topic, 96.0

        # Pure conditional constructs (no loops, no recursion)
        if constructs["is_conditional"]:
            if constructs["has_switch"]:
                primary = f"{lang}-switch"
            elif constructs["has_ternary"]:
                primary = f"{lang}-ternary-operator"
            else:
                primary = f"{lang}-if-else"
            canonical_topic = "conditions"
            return primary, secondaries, canonical_topic, 98.0

        # Object-Oriented / Classes
        if constructs["has_class_oop"] and re.search(
            r"\bobject\b|\bclass\b|\binherit\b|\boverride\b|\binterface\b|\bprotocol\b|\btrait\b", q_lower
        ):
            return f"{lang}-classes-objects", secondaries, "classes-objects", 92.0

        # Arrays / Collections
        if constructs["has_array"] and re.search(r"\barray\b|\belement\b|\bindex\b|\blength\b|\bslice\b", q_lower):
            return f"{lang}-arrays", secondaries, "arrays", 92.0

        # Default fallback — map broad topic IDs to fine-grained defaults
        clean_topic = topic_id.lower().replace("_", "-") if topic_id else "fundamentals"
        # Look up broad topic split defaults
        broad_entry = BROAD_TOPIC_SPLIT_MAP.get(topic_id or "")
        if broad_entry:
            clean_topic = broad_entry["default"]
        primary = f"{lang}-{clean_topic}"
        return primary, secondaries, clean_topic, 85.0

    @staticmethod
    def classify_broad_topic(
        topic_id: str,
        primary_concept: str,
        canonical_topic: str
    ) -> str:
        """
        Given a broad dataset topic_id (like 'control_flow', 'functions_scope'),
        returns the fine-grained topic_id to use in the DB.
        """
        broad_entry = BROAD_TOPIC_SPLIT_MAP.get(topic_id or "")
        if not broad_entry:
            return canonical_topic or topic_id

        # If canonical_topic is one of the fine-grained options, use it directly
        if canonical_topic in broad_entry["primary_concepts"]:
            return canonical_topic

        # Otherwise, check primary_concept keywords
        pc_lower = primary_concept.lower()
        for fine in broad_entry["primary_concepts"]:
            if fine.replace("-", "") in pc_lower.replace("-", ""):
                return fine

        return broad_entry["default"]

    @staticmethod
    def validate_negative_topic(
        target_topic: str,
        question_primary_concept: str,
        question_text: str,
        code_snippet: str
    ) -> Tuple[bool, str]:
        """
        NEGATIVE TOPIC VALIDATION (FAIL-CLOSED):
        Guarantees that a question does NOT primarily test an unrelated construct.
        Language-agnostic: checks code patterns for all loop syntaxes.
        """
        norm_target = (target_topic or "").lower().strip()
        q_text_norm = (question_text or "").lower()
        q_code_norm = (code_snippet or "").lower()

        # ── Rule 1: Conditions / If-Else ──────────────────────────
        if norm_target in ["conditions", "if-else", "if_else", "conditionals",
                           "conditional-statements", "conditional_statements"]:
            if "loop" in question_primary_concept:
                return False, f"Primary concept is '{question_primary_concept}' (Loop), not Conditional."
            if "recursion" in question_primary_concept or "recursive" in q_text_norm:
                return False, "Primary concept is Recursion, not Conditional."
            if "exception" in question_primary_concept or re.search(
                r"\bcatch\b|\btry\b|\bexception\b|\bthrow[s]?\b|\braise\b|\brescue\b", q_text_norm
            ):
                return False, "Primary concept is Exception/Error handling, not Conditional."
            if "thread" in question_primary_concept or "concurrency" in question_primary_concept:
                return False, "Primary concept is Threads/Concurrency, not Conditional."
            if "array" in question_primary_concept:
                return False, f"Primary concept is '{question_primary_concept}' (Array), not Conditional."
            if "class" in question_primary_concept or "oop" in question_primary_concept:
                return False, f"Primary concept is '{question_primary_concept}' (OOP/Class), not Conditional."
            if "jvm" in question_primary_concept or "architecture" in question_primary_concept:
                return False, "Primary concept is JVM Architecture, not Conditional."
            if "algorithm" in question_primary_concept or "complexity" in question_primary_concept:
                return False, "Primary concept is Algorithm/Complexity, not Conditional."

            # Code check: all loop syntaxes — language-agnostic
            loop_pattern = (
                r"\bfor\s*\(|"                           # Java/C/JS for(
                r"\bfor\s+\w[\w\s,]*\s+in\b|"           # Python/Go/Rust/Swift for x in
                r"\bfor\s+\w+\s*:=|"                     # Go for x :=
                r"\bfor\s*\{|"                            # Go infinite for {
                r"\bwhile\s*\(|"                          # Java/C/JS while(
                r"\bwhile\s+[\w\d(\"']|"                  # Python while cond
                r"\buntil\s+[\w\d(\"']|"                  # Ruby until
                r"\bdo\s*\{|"                             # do-while / Rust loop block
                r"\bloop\s*\{|"                           # Rust loop {}
                r"\.(each|times|upto|downto|step)\s*(\{|\bdo\b)|"  # Ruby iterators
                r"\bperform\s+\w+\s+(times|until|varying)\b"  # COBOL
            )
            if re.search(loop_pattern, q_code_norm):
                return False, "Code contains active loop constructs. Unrelated to pure conditions."

            if re.search(r"\bclass\s+(loop|fact|recur)", q_code_norm, re.IGNORECASE):
                return False, "Code belongs to Loop/Recursion category."

            # Must have at least one conditional token in code or specific conditional terminology in text
            has_condition_tokens = bool(
                re.search(r"\b(if-else|if statement|if condition|switch statement|switch case|conditional|conditionals|ternary operator|boolean logic|boolean condition)\b|['\"`]if['\"`]|['\"`]switch['\"`]|['\"`]else['\"`]", q_text_norm) or
                re.search(r"\bif\s*\(|\bif\s+[\w\d\"'(]|\belse\b|\bswitch\s*\(|\bcase\s+[\w\d'\"]+\s*:|\?\s*[^:]+\s*:", q_code_norm)
            )
            if not has_condition_tokens:
                return False, "Question contains no if-else, switch, or conditional branching constructs."

        # ── Rule 2: Loops ──────────────────────────────────────
        if norm_target in ["loops", "while", "for", "iteration", "for-loop", "while-loop", "do-while"]:
            if "if-else" in question_primary_concept and "loop" not in question_primary_concept:
                return False, f"Primary concept is '{question_primary_concept}' (If-Else), not Loop."
            # Must contain actual loop construct in code OR explicit loop terminology in text (NOT bare English preposition 'for')
            has_loop_tokens = bool(
                re.search(r"\b(for\s+loop|while\s+loop|for-loop|while-loop|do-while|loop|loops|looping|iteration|iterates|iterating)\b|['\"`]for['\"`]|['\"`]while['\"`]|['\"`]loop['\"`]", q_text_norm) or
                re.search(
                    r"\bfor\s*\(|\bwhile\s*\(|\bdo\s*\{|"
                    r"\bfor\s+[\w_,\s]+\s+in\b|\bfor\s+[\w_]+\s*:=|\bfor\s*\{|"
                    r"\bwhile\s+[\w\d(\"']|\bloop\s*\{|"
                    r"\.(each|times|upto|downto)\b",
                    q_code_norm
                )
            )
            if not has_loop_tokens:
                return False, "Question contains no loop constructs (any language)."

        # ── Rule 3: Recursion ───────────────────────────────────
        if norm_target in ["recursion", "recursive"]:
            if "loop" in question_primary_concept and "recursion" not in question_primary_concept:
                return False, f"Primary concept is '{question_primary_concept}' (Loop), not Recursion."
            has_recursion_tokens = bool(
                re.search(r"\brecursiv|\brecursion|\bbase.case\b|\bfactorial\b|\bfibonacci\b|\bhanoi\b", q_text_norm) or
                re.search(r"\brecursiv|\bfactorial|\bfibonacci", q_code_norm)
            )
            if not has_recursion_tokens:
                return False, "Question contains no recursion constructs or keywords."

        # ── Rule 4: Functions ───────────────────────────────────
        if norm_target in ["functions", "methods", "procedures"]:
            if "class" in question_primary_concept and "function" not in question_primary_concept:
                return False, "Primary concept is OOP/Class, not Functions."

        return True, "Passed negative topic validation."

    @staticmethod
    def compute_duplicate_group_id(
        question_text: str,
        options: List[str],
        code_snippet: str = "",
        language: str = ""
    ) -> str:
        """
        Multi-layer duplicate detection & clustering.
        Generates deterministic Duplicate Group ID (DG-XXXXX).
        """
        norm_q = QuestionClassifier.normalize_text(question_text)
        norm_code = QuestionClassifier.normalize_code_snippet(code_snippet or "")
        norm_opts = sorted([QuestionClassifier.normalize_text(opt) for opt in options])

        payload = f"{language.lower().strip()}###{norm_q}###{norm_code}###{'||'.join(norm_opts)}"
        hash_val = hashlib.sha256(payload.encode("utf-8")).hexdigest()[:8].upper()
        return f"DG-{hash_val}"
