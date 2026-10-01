import type { ProgrammingLanguageItem } from '../types/careerConnect';

/**
 * Scalable Programming Languages Learning Directory Catalogue
 * Contains 45+ programming languages across 7 categories.
 * Modules and topics contain titles and exact external URLs to MDN and W3Schools only.
 * Zero internally stored lesson articles or synthetic paragraph text.
 */
export const ALL_PROGRAMMING_LANGUAGES: ProgrammingLanguageItem[] = [
  {
    "id": "java",
    "name": "Java",
    "slug": "java",
    "aliases": [
      "java",
      "jvm",
      "jdk"
    ],
    "category": "General-purpose",
    "description": "Enterprise-grade, object-oriented, class-based language running on the JVM.",
    "isPopular": true,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "fundamentals",
        "title": "Java Fundamentals",
        "topics": [
          {
            "id": "intro-syntax",
            "title": "Syntax & Getting Started",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java Getting Started & Syntax",
                "referenceUrl": "https://www.w3schools.com/java/java_syntax.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "variables-datatypes",
            "title": "Variables & Primitive Data Types",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java Variables & Data Types",
                "referenceUrl": "https://www.w3schools.com/java/java_variables.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "operators",
            "title": "Operators & Expressions",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java Operators",
                "referenceUrl": "https://www.w3schools.com/java/java_operators.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "type-casting",
            "title": "Type Casting",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java Type Casting",
                "referenceUrl": "https://www.w3schools.com/java/java_type_casting.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "strings",
            "title": "Strings & String Methods",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java Strings Reference",
                "referenceUrl": "https://www.w3schools.com/java/java_strings.asp",
                "isPrimary": true
              }
            ]
          }
        ]
      },
      {
        "id": "control-flow",
        "title": "Control Flow & Methods",
        "topics": [
          {
            "id": "conditions",
            "title": "If...Else & Switch Statements",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java If...Else & Conditions",
                "referenceUrl": "https://www.w3schools.com/java/java_conditions.asp",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java Switch Statements",
                "referenceUrl": "https://www.w3schools.com/java/java_switch.asp"
              }
            ]
          },
          {
            "id": "loops",
            "title": "While, For & For-Each Loops",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java For Loop & Foreach",
                "referenceUrl": "https://www.w3schools.com/java/java_for_loop.asp",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java While Loop",
                "referenceUrl": "https://www.w3schools.com/java/java_while_loop.asp"
              }
            ]
          },
          {
            "id": "arrays",
            "title": "Single & Multidimensional Arrays",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java Arrays",
                "referenceUrl": "https://www.w3schools.com/java/java_arrays.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "methods",
            "title": "Methods, Parameters & Overloading",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java Methods & Overloading",
                "referenceUrl": "https://www.w3schools.com/java/java_methods.asp",
                "isPrimary": true
              }
            ]
          }
        ]
      },
      {
        "id": "oop",
        "title": "Object-Oriented Programming (OOP)",
        "topics": [
          {
            "id": "classes-objects",
            "title": "Classes & Objects",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java Classes and Objects",
                "referenceUrl": "https://www.w3schools.com/java/java_classes.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "constructors",
            "title": "Constructors",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java Constructors",
                "referenceUrl": "https://www.w3schools.com/java/java_constructors.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "encapsulation",
            "title": "Encapsulation & Access Modifiers",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java Encapsulation & Getters/Setters",
                "referenceUrl": "https://www.w3schools.com/java/java_encapsulation.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "inheritance",
            "title": "Inheritance & super Keyword",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java Inheritance (Subclass & Superclass)",
                "referenceUrl": "https://www.w3schools.com/java/java_inheritance.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "polymorphism",
            "title": "Polymorphism (Overriding & Overloading)",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java Polymorphism",
                "referenceUrl": "https://www.w3schools.com/java/java_polymorphism.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "abstraction",
            "title": "Abstract Classes & Methods",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java Abstraction & Abstract Classes",
                "referenceUrl": "https://www.w3schools.com/java/java_abstract.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "interfaces",
            "title": "Interfaces & Multiple Inheritance",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java Interface Tutorial",
                "referenceUrl": "https://www.w3schools.com/java/java_interface.asp",
                "isPrimary": true
              }
            ]
          }
        ]
      },
      {
        "id": "advanced-java",
        "title": "Advanced Java & Collections",
        "topics": [
          {
            "id": "exceptions",
            "title": "Exception Handling (try, catch, throw, throws, finally)",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java Exceptions - Try...Catch",
                "referenceUrl": "https://www.w3schools.com/java/java_try_catch.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "arraylist",
            "title": "ArrayList & List Interface",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java ArrayList Tutorial",
                "referenceUrl": "https://www.w3schools.com/java/java_arraylist.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "hashmap",
            "title": "HashMap & Map Interface",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java HashMap Guide",
                "referenceUrl": "https://www.w3schools.com/java/java_hashmap.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "hashset",
            "title": "HashSet & Set Interface",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java HashSet Guide",
                "referenceUrl": "https://www.w3schools.com/java/java_hashset.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "threads",
            "title": "Multithreading & Concurrency",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java Threads & Concurrency",
                "referenceUrl": "https://www.w3schools.com/java/java_threads.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "lambda",
            "title": "Lambda Expressions & Functional Interfaces",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java Lambda Expressions",
                "referenceUrl": "https://www.w3schools.com/java/java_lambda.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "file-handling",
            "title": "File Handling (Read, Write, Create, Delete)",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Java File Handling",
                "referenceUrl": "https://www.w3schools.com/java/java_files.asp",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "python",
    "name": "Python",
    "slug": "python",
    "aliases": [
      "python",
      "py",
      "python3"
    ],
    "category": "General-purpose",
    "description": "High-level, dynamically typed language known for clean syntax, data science, and web APIs.",
    "isPopular": true,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "fundamentals",
        "title": "Python Fundamentals",
        "topics": [
          {
            "id": "syntax-intro",
            "title": "Syntax, Indentation & Comments",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Python Syntax Tutorial",
                "referenceUrl": "https://www.w3schools.com/python/python_syntax.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "variables",
            "title": "Variables, Casting & Scope",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Python Variables Guide",
                "referenceUrl": "https://www.w3schools.com/python/python_variables.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "datatypes",
            "title": "Built-in Data Types",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Python Data Types",
                "referenceUrl": "https://www.w3schools.com/python/python_datatypes.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "operators",
            "title": "Operators (Arithmetic, Logical, Bitwise)",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Python Operators",
                "referenceUrl": "https://www.w3schools.com/python/python_operators.asp",
                "isPrimary": true
              }
            ]
          }
        ]
      },
      {
        "id": "collections",
        "title": "Data Structures & Collections",
        "topics": [
          {
            "id": "lists",
            "title": "Lists & List Comprehensions",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Python Lists Reference",
                "referenceUrl": "https://www.w3schools.com/python/python_lists.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "tuples",
            "title": "Tuples & Immutability",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Python Tuples Tutorial",
                "referenceUrl": "https://www.w3schools.com/python/python_tuples.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "sets",
            "title": "Sets & Set Operations",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Python Sets Guide",
                "referenceUrl": "https://www.w3schools.com/python/python_sets.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "dictionaries",
            "title": "Dictionaries & Key-Value Lookup",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Python Dictionaries Reference",
                "referenceUrl": "https://www.w3schools.com/python/python_dictionaries.asp",
                "isPrimary": true
              }
            ]
          }
        ]
      },
      {
        "id": "control-functions",
        "title": "Control Flow & Functions",
        "topics": [
          {
            "id": "conditions",
            "title": "If...Elif...Else Conditions",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Python Conditions and If statements",
                "referenceUrl": "https://www.w3schools.com/python/python_conditions.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "loops",
            "title": "While & For Loops",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Python For Loops",
                "referenceUrl": "https://www.w3schools.com/python/python_for_loops.asp",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Python While Loops",
                "referenceUrl": "https://www.w3schools.com/python/python_while_loops.asp"
              }
            ]
          },
          {
            "id": "functions",
            "title": "Functions, *args & **kwargs",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Python Functions Guide",
                "referenceUrl": "https://www.w3schools.com/python/python_functions.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "lambda",
            "title": "Lambda Functions & Higher-Order Functions",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Python Lambda Functions",
                "referenceUrl": "https://www.w3schools.com/python/python_lambda.asp",
                "isPrimary": true
              }
            ]
          }
        ]
      },
      {
        "id": "oop",
        "title": "Object-Oriented Programming (OOP)",
        "topics": [
          {
            "id": "classes-objects",
            "title": "Classes & Objects (__init__, self)",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Python Classes and Objects",
                "referenceUrl": "https://www.w3schools.com/python/python_classes.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "inheritance",
            "title": "Inheritance & super()",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Python Inheritance Tutorial",
                "referenceUrl": "https://www.w3schools.com/python/python_inheritance.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "iterators",
            "title": "Iterators & Generators (__iter__, __next__)",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Python Iterators",
                "referenceUrl": "https://www.w3schools.com/python/python_iterators.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "polymorphism",
            "title": "Polymorphism & Duck Typing",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Python Polymorphism",
                "referenceUrl": "https://www.w3schools.com/python/python_polymorphism.asp",
                "isPrimary": true
              }
            ]
          }
        ]
      },
      {
        "id": "advanced-python",
        "title": "Advanced Python & Modules",
        "topics": [
          {
            "id": "exceptions",
            "title": "Exception Handling (try, except, finally, raise)",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Python Try...Except",
                "referenceUrl": "https://www.w3schools.com/python/python_try_except.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "modules",
            "title": "Modules & Packages",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Python Modules Guide",
                "referenceUrl": "https://www.w3schools.com/python/python_modules.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "file-io",
            "title": "File Handling (open, with, read, write)",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Python File Open & Read",
                "referenceUrl": "https://www.w3schools.com/python/python_file_handling.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "pip",
            "title": "PIP Package Manager & Virtual Environments",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Python PIP Tutorial",
                "referenceUrl": "https://www.w3schools.com/python/python_pip.asp",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "javascript",
    "name": "JavaScript",
    "slug": "javascript",
    "aliases": [
      "javascript",
      "js",
      "ecmascript",
      "es6"
    ],
    "category": "Web",
    "description": "The dynamic programming language of the open Web platform and Node.js environments.",
    "isPopular": true,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "fundamentals",
        "title": "JavaScript Fundamentals",
        "topics": [
          {
            "id": "intro-syntax",
            "title": "Grammar, Types & Expressions",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "Grammar and types - JavaScript | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "JavaScript Syntax",
                "referenceUrl": "https://www.w3schools.com/js/js_syntax.asp"
              }
            ]
          },
          {
            "id": "variables",
            "title": "Variables (var, let, const & Scope)",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "Declarations & let/const - JavaScript | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "JavaScript Variables",
                "referenceUrl": "https://www.w3schools.com/js/js_variables.asp"
              }
            ]
          },
          {
            "id": "data-types",
            "title": "Primitive Types & Type Coercion",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "JavaScript data types and data structures | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "JavaScript Data Types",
                "referenceUrl": "https://www.w3schools.com/js/js_datatypes.asp"
              }
            ]
          },
          {
            "id": "operators",
            "title": "Operators (Equality ===, Spread ..., Destructuring)",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "Expressions and operators | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "JavaScript Operators",
                "referenceUrl": "https://www.w3schools.com/js/js_operators.asp"
              }
            ]
          }
        ]
      },
      {
        "id": "functions-objects",
        "title": "Functions, Closures & Objects",
        "topics": [
          {
            "id": "functions",
            "title": "Functions & Arrow Functions",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "Functions - JavaScript | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "JavaScript Arrow Function",
                "referenceUrl": "https://www.w3schools.com/js/js_arrow_function.asp"
              }
            ]
          },
          {
            "id": "closures",
            "title": "Closures & Lexical Scoping",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "Closures - JavaScript | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "objects",
            "title": "Objects, Properties & Prototype Chain",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "Working with objects | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "JavaScript Objects Tutorial",
                "referenceUrl": "https://www.w3schools.com/js/js_objects.asp"
              }
            ]
          },
          {
            "id": "arrays",
            "title": "Array Methods (map, filter, reduce, find)",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "Array - JavaScript | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "JavaScript Array Iteration",
                "referenceUrl": "https://www.w3schools.com/js/js_array_iteration.asp"
              }
            ]
          }
        ]
      },
      {
        "id": "classes-oop",
        "title": "ES6 Classes & Object-Oriented Design",
        "topics": [
          {
            "id": "classes",
            "title": "Classes, Constructors & Methods",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "Classes - JavaScript | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "JavaScript Classes Tutorial",
                "referenceUrl": "https://www.w3schools.com/js/js_classes.asp"
              }
            ]
          },
          {
            "id": "inheritance",
            "title": "Class Inheritance (extends & super)",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "extends keyword - JavaScript | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "JavaScript Class Inheritance",
                "referenceUrl": "https://www.w3schools.com/js/js_class_inheritance.asp"
              }
            ]
          },
          {
            "id": "static-private",
            "title": "Static Methods & Private Class Fields",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "Private class features | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties",
                "isPrimary": true
              }
            ]
          }
        ]
      },
      {
        "id": "async-js",
        "title": "Asynchronous JavaScript & Event Loop",
        "topics": [
          {
            "id": "promises",
            "title": "Promises (then, catch, finally, all, race)",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "Using Promises - JavaScript | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "JavaScript Promises",
                "referenceUrl": "https://www.w3schools.com/js/js_promise.asp"
              }
            ]
          },
          {
            "id": "async-await",
            "title": "Async / Await Syntax & Error Handling",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "async function - JavaScript | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "JavaScript Async/Await",
                "referenceUrl": "https://www.w3schools.com/js/js_async.asp"
              }
            ]
          },
          {
            "id": "fetch-api",
            "title": "Fetch API & HTTP Requests",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "Using the Fetch API | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "event-loop",
            "title": "The Event Loop, Microtasks & Macrotasks",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "The event loop - JavaScript | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop",
                "isPrimary": true
              }
            ]
          }
        ]
      },
      {
        "id": "web-apis",
        "title": "DOM & Browser Web APIs",
        "topics": [
          {
            "id": "dom",
            "title": "DOM Manipulation (querySelector, createElement)",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "Introduction to the DOM | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "JavaScript HTML DOM",
                "referenceUrl": "https://www.w3schools.com/js/js_htmldom.asp"
              }
            ]
          },
          {
            "id": "events",
            "title": "Event Handling & Event Delegation",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "Introduction to events | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "JavaScript Events Tutorial",
                "referenceUrl": "https://www.w3schools.com/js/js_events.asp"
              }
            ]
          },
          {
            "id": "storage",
            "title": "Web Storage (localStorage, sessionStorage, Cookies)",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "Window.localStorage | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "cpp",
    "name": "C++",
    "slug": "cpp",
    "aliases": [
      "cpp",
      "c++",
      "cplusplus"
    ],
    "category": "Systems / Low-level",
    "description": "High-performance systems programming language with zero-cost abstractions, RAII, and manual memory control.",
    "isPopular": true,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "basics",
        "title": "C++ Fundamentals",
        "topics": [
          {
            "id": "syntax",
            "title": "Syntax, Headers & main() Function",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C++ Syntax Tutorial",
                "referenceUrl": "https://www.w3schools.com/cpp/cpp_syntax.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "variables",
            "title": "Variables, Data Types & Constants",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C++ Variables & Types",
                "referenceUrl": "https://www.w3schools.com/cpp/cpp_variables.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "operators",
            "title": "Operators & Bitwise Logic",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C++ Operators",
                "referenceUrl": "https://www.w3schools.com/cpp/cpp_operators.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "control-flow",
            "title": "If/Else Conditions & Loops",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C++ Conditions & Loops",
                "referenceUrl": "https://www.w3schools.com/cpp/cpp_conditions.asp",
                "isPrimary": true
              }
            ]
          }
        ]
      },
      {
        "id": "memory",
        "title": "Pointers, References & Memory",
        "topics": [
          {
            "id": "pointers",
            "title": "Pointers, Dereferencing & Nullptr",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C++ Pointers Tutorial",
                "referenceUrl": "https://www.w3schools.com/cpp/cpp_pointers.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "references",
            "title": "References & Pass-by-Reference",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C++ References",
                "referenceUrl": "https://www.w3schools.com/cpp/cpp_references.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "dynamic-memory",
            "title": "Dynamic Memory Allocation (new & delete)",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C++ Memory Management",
                "referenceUrl": "https://www.w3schools.com/cpp/cpp_pointers.asp",
                "isPrimary": true
              }
            ]
          }
        ]
      },
      {
        "id": "oop",
        "title": "Object-Oriented Programming (OOP)",
        "topics": [
          {
            "id": "classes-objects",
            "title": "Classes, Access Specifiers & Objects",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C++ Classes and Objects",
                "referenceUrl": "https://www.w3schools.com/cpp/cpp_classes.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "constructors-destructors",
            "title": "Constructors & Destructors",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C++ Constructors Tutorial",
                "referenceUrl": "https://www.w3schools.com/cpp/cpp_constructors.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "encapsulation",
            "title": "Encapsulation & Member Functions",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C++ Encapsulation",
                "referenceUrl": "https://www.w3schools.com/cpp/cpp_encapsulation.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "inheritance",
            "title": "Inheritance (Public, Protected, Private)",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C++ Inheritance Tutorial",
                "referenceUrl": "https://www.w3schools.com/cpp/cpp_inheritance.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "polymorphism",
            "title": "Polymorphism & Virtual Functions",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C++ Polymorphism & Virtual Functions",
                "referenceUrl": "https://www.w3schools.com/cpp/cpp_polymorphism.asp",
                "isPrimary": true
              }
            ]
          }
        ]
      },
      {
        "id": "modern-cpp",
        "title": "Modern C++ (STL & Features)",
        "topics": [
          {
            "id": "stl-vectors",
            "title": "STL Containers (std::vector, std::map, std::set)",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C++ Vector & Data Structures",
                "referenceUrl": "https://www.w3schools.com/cpp/cpp_arrays.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "exceptions",
            "title": "Exception Handling (try, catch, throw)",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C++ Exceptions - Try and Catch",
                "referenceUrl": "https://www.w3schools.com/cpp/cpp_exceptions.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "files",
            "title": "File I/O Streams (ifstream, ofstream)",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C++ Files & Streams",
                "referenceUrl": "https://www.w3schools.com/cpp/cpp_files.asp",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "csharp",
    "name": "C#",
    "slug": "csharp",
    "aliases": [
      "csharp",
      "c#",
      "cs",
      "dotnet"
    ],
    "category": "General-purpose",
    "description": "Modern, object-oriented language developed by Microsoft for .NET, cloud, enterprise, and game engines (Unity).",
    "isPopular": true,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "basics",
        "title": "C# Fundamentals",
        "topics": [
          {
            "id": "syntax",
            "title": "Syntax & Program Structure",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C# Syntax Tutorial",
                "referenceUrl": "https://www.w3schools.com/cs/cs_syntax.php",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "variables",
            "title": "Variables & Data Types",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C# Variables Guide",
                "referenceUrl": "https://www.w3schools.com/cs/cs_variables.php",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "conditions-loops",
            "title": "Conditional Statements & Loops",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C# If...Else & Loops",
                "referenceUrl": "https://www.w3schools.com/cs/cs_conditions.php",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "methods",
            "title": "Methods, Arguments & Overloading",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C# Methods Tutorial",
                "referenceUrl": "https://www.w3schools.com/cs/cs_methods.php",
                "isPrimary": true
              }
            ]
          }
        ]
      },
      {
        "id": "oop",
        "title": "Object-Oriented C#",
        "topics": [
          {
            "id": "classes-objects",
            "title": "Classes, Objects & Constructors",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C# Classes & Objects",
                "referenceUrl": "https://www.w3schools.com/cs/cs_classes.php",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "properties",
            "title": "Properties & Encapsulation",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C# Properties (Get and Set)",
                "referenceUrl": "https://www.w3schools.com/cs/cs_properties.php",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "inheritance",
            "title": "Inheritance & base Keyword",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C# Inheritance Tutorial",
                "referenceUrl": "https://www.w3schools.com/cs/cs_inheritance.php",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "polymorphism",
            "title": "Polymorphism (virtual & override)",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C# Polymorphism Tutorial",
                "referenceUrl": "https://www.w3schools.com/cs/cs_polymorphism.php",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "interfaces",
            "title": "Interfaces & Abstraction",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C# Interface Guide",
                "referenceUrl": "https://www.w3schools.com/cs/cs_interface.php",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "exceptions",
            "title": "Exception Handling (try-catch)",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C# Exceptions - Try...Catch",
                "referenceUrl": "https://www.w3schools.com/cs/cs_exceptions.php",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "sql",
    "name": "SQL",
    "slug": "sql",
    "aliases": [
      "sql",
      "rdbms",
      "database",
      "postgres",
      "mysql"
    ],
    "category": "Database / Query",
    "description": "Standard declarative query language for relational databases, schema design, and analytical queries.",
    "isPopular": true,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "basics",
        "title": "SQL Fundamentals",
        "topics": [
          {
            "id": "select",
            "title": "SELECT & Column Aliases",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "SQL SELECT Statement",
                "referenceUrl": "https://www.w3schools.com/sql/sql_select.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "where",
            "title": "WHERE Clause & Filtering Operators",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "SQL WHERE Clause",
                "referenceUrl": "https://www.w3schools.com/sql/sql_where.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "crud",
            "title": "INSERT, UPDATE & DELETE",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "SQL INSERT INTO",
                "referenceUrl": "https://www.w3schools.com/sql/sql_insert.asp",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "SQL UPDATE",
                "referenceUrl": "https://www.w3schools.com/sql/sql_update.asp"
              }
            ]
          },
          {
            "id": "orderby",
            "title": "ORDER BY & Sorting",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "SQL ORDER BY Keyword",
                "referenceUrl": "https://www.w3schools.com/sql/sql_orderby.asp",
                "isPrimary": true
              }
            ]
          }
        ]
      },
      {
        "id": "joins-aggregations",
        "title": "Joins, Groups & Aggregations",
        "topics": [
          {
            "id": "joins",
            "title": "INNER, LEFT, RIGHT & FULL Joins",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "SQL Joins Guide",
                "referenceUrl": "https://www.w3schools.com/sql/sql_join.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "groupby",
            "title": "GROUP BY & HAVING Clauses",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "SQL GROUP BY Statement",
                "referenceUrl": "https://www.w3schools.com/sql/sql_groupby.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "aggregate-functions",
            "title": "Aggregate Functions (COUNT, SUM, AVG, MIN, MAX)",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "SQL COUNT(), AVG() and SUM()",
                "referenceUrl": "https://www.w3schools.com/sql/sql_count_avg_sum.asp",
                "isPrimary": true
              }
            ]
          }
        ]
      },
      {
        "id": "ddl-schema",
        "title": "Data Definition (DDL) & Indexes",
        "topics": [
          {
            "id": "create-table",
            "title": "CREATE TABLE & Constraints",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "SQL CREATE TABLE Statement",
                "referenceUrl": "https://www.w3schools.com/sql/sql_create_table.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "keys",
            "title": "PRIMARY KEY & FOREIGN KEY",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "SQL Primary Key Constraint",
                "referenceUrl": "https://www.w3schools.com/sql/sql_primarykey.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "indexes",
            "title": "CREATE INDEX & Query Optimization",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "SQL CREATE INDEX Statement",
                "referenceUrl": "https://www.w3schools.com/sql/sql_create_index.asp",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "typescript",
    "name": "TypeScript",
    "slug": "typescript",
    "aliases": [
      "typescript",
      "ts"
    ],
    "category": "Web",
    "description": "Typed superset of JavaScript that compiles to plain JavaScript with compile-time type safety.",
    "isPopular": true,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "fundamentals",
        "title": "TypeScript Fundamentals",
        "topics": [
          {
            "id": "types",
            "title": "Basic Types (string, number, boolean, array, tuple)",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Everyday Types - TypeScript Handbook",
                "referenceUrl": "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html",
                "isPrimary": true
              },
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "TypeScript basics | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Frameworks_libraries/TypeScript_basics"
              }
            ]
          },
          {
            "id": "interfaces-types",
            "title": "Interfaces vs Type Aliases",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Object Types - TypeScript Handbook",
                "referenceUrl": "https://www.typescriptlang.org/docs/handbook/2/objects.html",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "union-narrowing",
            "title": "Union Types & Type Narrowing",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Narrowing - TypeScript Handbook",
                "referenceUrl": "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
                "isPrimary": true
              }
            ]
          }
        ]
      },
      {
        "id": "advanced",
        "title": "Generics & Advanced Types",
        "topics": [
          {
            "id": "generics",
            "title": "Generics in Functions & Interfaces",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Generics - TypeScript Handbook",
                "referenceUrl": "https://www.typescriptlang.org/docs/handbook/2/generics.html",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "utility-types",
            "title": "Utility Types (Partial, Required, Readonly, Record)",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Utility Types Reference - TypeScript",
                "referenceUrl": "https://www.typescriptlang.org/docs/handbook/utility-types.html",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "golang",
    "name": "Go",
    "slug": "golang",
    "aliases": [
      "golang",
      "go"
    ],
    "category": "Systems / Low-level",
    "description": "Fast, statically typed, compiled language engineered by Google for concurrent distributed backend services.",
    "isPopular": true,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "basics",
        "title": "Go Fundamentals",
        "topics": [
          {
            "id": "syntax-packages",
            "title": "Packages, Variables & Functions",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "A Tour of Go: Basics",
                "referenceUrl": "https://go.dev/tour/basics/1",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "flow-control",
            "title": "Flow Control (for, if/else, switch, defer)",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "A Tour of Go: Flow control statements",
                "referenceUrl": "https://go.dev/tour/flowcontrol/1",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "structs-slices",
            "title": "Structs, Slices, Maps & Pointers",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "A Tour of Go: More types - structs, slices, maps",
                "referenceUrl": "https://go.dev/tour/moretypes/1",
                "isPrimary": true
              }
            ]
          }
        ]
      },
      {
        "id": "concurrency",
        "title": "Methods, Interfaces & Concurrency",
        "topics": [
          {
            "id": "methods-interfaces",
            "title": "Methods & Interfaces",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "A Tour of Go: Methods and interfaces",
                "referenceUrl": "https://go.dev/tour/methods/1",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "goroutines",
            "title": "Goroutines & Channels",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "A Tour of Go: Concurrency",
                "referenceUrl": "https://go.dev/tour/concurrency/1",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "rust",
    "name": "Rust",
    "slug": "rust",
    "aliases": [
      "rust",
      "rs"
    ],
    "category": "Systems / Low-level",
    "description": "Blazingly fast memory-safe systems programming language with zero-cost abstractions and no garbage collector.",
    "isPopular": true,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "basics",
        "title": "Rust Fundamentals",
        "topics": [
          {
            "id": "syntax-variables",
            "title": "Variables, Mutability & Data Types",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Variables and Mutability - The Rust Book",
                "referenceUrl": "https://doc.rust-lang.org/book/ch03-01-variables-and-mutability.html",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "functions-control",
            "title": "Functions & Control Flow",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Control Flow - The Rust Book",
                "referenceUrl": "https://doc.rust-lang.org/book/ch03-05-control-flow.html",
                "isPrimary": true
              }
            ]
          }
        ]
      },
      {
        "id": "ownership",
        "title": "Ownership, Borrowing & Lifetimes",
        "topics": [
          {
            "id": "ownership-rules",
            "title": "What is Ownership?",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "What is Ownership? - The Rust Book",
                "referenceUrl": "https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "references-borrowing",
            "title": "References & Borrowing (& and &mut)",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "References and Borrowing - The Rust Book",
                "referenceUrl": "https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "structs-traits",
            "title": "Structs, Enums & Traits",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Traits: Defining Shared Behavior - The Rust Book",
                "referenceUrl": "https://doc.rust-lang.org/book/ch10-02-traits.html",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "c",
    "name": "C",
    "slug": "c",
    "aliases": [
      "c",
      "clang"
    ],
    "category": "Systems / Low-level",
    "description": "Foundational procedural programming language powering operating systems, hardware drivers, and embedded systems.",
    "isPopular": true,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "fundamentals",
        "title": "C Fundamentals",
        "topics": [
          {
            "id": "syntax",
            "title": "C Syntax & Structure",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C Syntax Tutorial",
                "referenceUrl": "https://www.w3schools.com/c/c_syntax.php",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "variables-types",
            "title": "Variables & Primitive Data Types",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C Variables & Data Types",
                "referenceUrl": "https://www.w3schools.com/c/c_variables.php",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "operators-conditions",
            "title": "Operators & If...Else Statements",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C Conditions & Booleans",
                "referenceUrl": "https://www.w3schools.com/c/c_conditions.php",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "pointers",
            "title": "Pointers & Memory Addresses (& and *)",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C Pointers Tutorial",
                "referenceUrl": "https://www.w3schools.com/c/c_pointers.php",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "structs",
            "title": "Structures (struct)",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "C Structures (structs)",
                "referenceUrl": "https://www.w3schools.com/c/c_structs.php",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "php",
    "name": "PHP",
    "slug": "php",
    "aliases": [
      "php",
      "hypertext"
    ],
    "category": "Web",
    "description": "Widely used open source server-side scripting language especially suited for web applications.",
    "isPopular": true,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "fundamentals",
        "title": "PHP Fundamentals",
        "topics": [
          {
            "id": "syntax",
            "title": "PHP Syntax & Variables",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "PHP Syntax Guide",
                "referenceUrl": "https://www.w3schools.com/php/php_syntax.asp",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "oop",
            "title": "PHP OOP: Classes, Objects & Inheritance",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "PHP OOP Classes & Objects",
                "referenceUrl": "https://www.w3schools.com/php/php_oop_classes_objects.asp",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "PHP OOP Inheritance",
                "referenceUrl": "https://www.w3schools.com/php/php_oop_inheritance.asp"
              }
            ]
          },
          {
            "id": "mysql",
            "title": "PHP Database Connection (MySQL / PDO)",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "PHP MySQL Database Tutorial",
                "referenceUrl": "https://www.w3schools.com/php/php_mysql_intro.asp",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "html",
    "name": "HTML",
    "slug": "html",
    "aliases": [
      "html",
      "html5",
      "markup"
    ],
    "category": "Web",
    "description": "Standard markup language for documents designed to be displayed in a web browser.",
    "isPopular": true,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "fundamentals",
        "title": "HTML Core Elements",
        "topics": [
          {
            "id": "syntax-elements",
            "title": "Basic HTML Structure & Elements",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "Getting started with HTML | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "HTML Basic Tutorial",
                "referenceUrl": "https://www.w3schools.com/html/html_basic.asp"
              }
            ]
          },
          {
            "id": "forms",
            "title": "HTML Forms & Input Types",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "HTML forms guide | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "HTML Forms",
                "referenceUrl": "https://www.w3schools.com/html/html_forms.asp"
              }
            ]
          },
          {
            "id": "semantic",
            "title": "Semantic HTML (nav, header, article, section)",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "HTML semantic elements | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Glossary/Semantics",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "css",
    "name": "CSS",
    "slug": "css",
    "aliases": [
      "css",
      "css3",
      "styles",
      "stylesheet"
    ],
    "category": "Web",
    "description": "Stylesheet language used for specifying the presentation and layout of HTML documents.",
    "isPopular": true,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "fundamentals",
        "title": "CSS Layout & Selectors",
        "topics": [
          {
            "id": "selectors",
            "title": "Selectors & Specificity",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "CSS selectors | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Basic_CSS_selectors",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "CSS Selectors",
                "referenceUrl": "https://www.w3schools.com/css/css_selectors.asp"
              }
            ]
          },
          {
            "id": "box-model",
            "title": "The Box Model (Margin, Border, Padding, Content)",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "The box model | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "CSS Box Model",
                "referenceUrl": "https://www.w3schools.com/css/css_boxmodel.asp"
              }
            ]
          },
          {
            "id": "flexbox",
            "title": "Flexbox (Flexible Box Layout)",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "CSS Flexible Box Layout | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "CSS Flexbox",
                "referenceUrl": "https://www.w3schools.com/css/css3_flexbox.asp"
              }
            ]
          },
          {
            "id": "grid",
            "title": "CSS Grid Layout",
            "externalReferences": [
              {
                "sourceName": "MDN Web Docs",
                "referenceTitle": "Grids - CSS | MDN",
                "referenceUrl": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "CSS Grid Layout",
                "referenceUrl": "https://www.w3schools.com/css/css_grid.asp"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "kotlin",
    "name": "Kotlin",
    "slug": "kotlin",
    "aliases": [
      "kotlin",
      "kt",
      "android"
    ],
    "category": "Mobile",
    "description": "Cross-platform, statically typed, general-purpose language with type inference, officially preferred for Android development.",
    "isPopular": true,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "fundamentals",
        "title": "Kotlin Fundamentals",
        "topics": [
          {
            "id": "syntax",
            "title": "Syntax & Basic Types",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Basic syntax - Kotlin",
                "referenceUrl": "https://kotlinlang.org/docs/basic-syntax.html",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Kotlin Syntax Tutorial",
                "referenceUrl": "https://www.w3schools.com/kotlin/kotlin_syntax.php"
              }
            ]
          },
          {
            "id": "classes",
            "title": "Classes, Inheritance & Properties",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Classes and Objects - Kotlin",
                "referenceUrl": "https://kotlinlang.org/docs/classes.html",
                "isPrimary": true
              },
              {
                "sourceName": "W3Schools",
                "referenceTitle": "Kotlin Classes and Objects",
                "referenceUrl": "https://www.w3schools.com/kotlin/kotlin_classes.php"
              }
            ]
          },
          {
            "id": "coroutines",
            "title": "Coroutines & Asynchronous Programming",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Coroutines overview - Kotlin",
                "referenceUrl": "https://kotlinlang.org/docs/coroutines-overview.html",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "swift",
    "name": "Swift",
    "slug": "swift",
    "aliases": [
      "swift",
      "ios",
      "apple"
    ],
    "category": "Mobile",
    "description": "Fast, safe, modern language developed by Apple for iOS, macOS, watchOS, and tvOS development.",
    "isPopular": true,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "fundamentals",
        "title": "Swift Core Concepts",
        "topics": [
          {
            "id": "basics",
            "title": "The Basics (Constants, Variables, Optionals)",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "The Basics - The Swift Programming Language",
                "referenceUrl": "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/thebasics/",
                "isPrimary": true
              }
            ]
          },
          {
            "id": "classes-structs",
            "title": "Structures, Classes & Value vs Reference Types",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Structures and Classes - Swift Book",
                "referenceUrl": "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/classesandstructures/",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "dart",
    "name": "Dart",
    "slug": "dart",
    "aliases": [
      "dart",
      "flutter"
    ],
    "category": "Mobile",
    "description": "Client-optimized programming language for building multi-platform apps using Flutter.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "fundamentals",
        "title": "Dart Fundamentals",
        "topics": [
          {
            "id": "syntax",
            "title": "Dart Language Tour & Core Types",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Dart Language Tour",
                "referenceUrl": "https://dart.dev/guides/language/language-tour",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "bash",
    "name": "Bash",
    "slug": "bash",
    "aliases": [
      "bash",
      "sh",
      "shell",
      "zsh"
    ],
    "category": "Scripting / Shell",
    "description": "Unix shell command language for system automation, scripting, and pipeline execution.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "scripting",
        "title": "Shell Scripting & Pipelines",
        "topics": [
          {
            "id": "variables-pipes",
            "title": "Variables, Pipes (|), and Redirection",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "GNU Bash Reference Manual",
                "referenceUrl": "https://www.gnu.org/software/bash/manual/bash.html",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "powershell",
    "name": "PowerShell",
    "slug": "powershell",
    "aliases": [
      "powershell",
      "ps",
      "pwsh"
    ],
    "category": "Scripting / Shell",
    "description": "Task automation and configuration management framework with an object-oriented command-line shell.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "scripting",
        "title": "Cmdlets & Pipeline Objects",
        "topics": [
          {
            "id": "cmdlets",
            "title": "PowerShell Cmdlets & Pipelines",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Microsoft PowerShell Documentation",
                "referenceUrl": "https://learn.microsoft.com/en-us/powershell/",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "ruby",
    "name": "Ruby",
    "slug": "ruby",
    "aliases": [
      "ruby",
      "rb",
      "rails"
    ],
    "category": "General-purpose",
    "description": "Dynamic, open source language with a focus on simplicity and productivity, powering Ruby on Rails.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "fundamentals",
        "title": "Ruby Fundamentals",
        "topics": [
          {
            "id": "syntax",
            "title": "Ruby Syntax, Blocks & OOP",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Ruby Official Documentation",
                "referenceUrl": "https://www.ruby-lang.org/en/documentation/",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "scala",
    "name": "Scala",
    "slug": "scala",
    "aliases": [
      "scala",
      "spark"
    ],
    "category": "General-purpose",
    "description": "Combines object-oriented and functional programming in one concise, high-level language on the JVM.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "fundamentals",
        "title": "Scala & Functional Programming",
        "topics": [
          {
            "id": "syntax",
            "title": "Scala Syntax, Case Classes & Pattern Matching",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Scala Documentation Tour",
                "referenceUrl": "https://docs.scala-lang.org/tour/tour-of-scala.html",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "r",
    "name": "R",
    "slug": "r",
    "aliases": [
      "r",
      "rlang",
      "statistics"
    ],
    "category": "General-purpose",
    "description": "Language and environment for statistical computing, graphics, and data analytics.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "fundamentals",
        "title": "R Statistics & Data Frames",
        "topics": [
          {
            "id": "vectors-dataframes",
            "title": "Vectors, Factors & Data Frames",
            "externalReferences": [
              {
                "sourceName": "W3Schools",
                "referenceTitle": "R Tutorial",
                "referenceUrl": "https://www.w3schools.com/r/default.asp",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "assembly",
    "name": "Assembly",
    "slug": "assembly",
    "aliases": [
      "assembly",
      "asm",
      "nasm",
      "x86",
      "arm"
    ],
    "category": "Systems / Low-level",
    "description": "Low-level programming language providing direct CPU hardware instruction control.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "architecture",
        "title": "Registers & Instruction Sets",
        "topics": [
          {
            "id": "x86-registers",
            "title": "x86-64 Registers & Machine Instructions",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "x86 Assembly Guide",
                "referenceUrl": "https://www.cs.virginia.edu/~evans/cs216/guides/x86.html",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "solidity",
    "name": "Solidity",
    "slug": "solidity",
    "aliases": [
      "solidity",
      "sol",
      "ethereum",
      "web3"
    ],
    "category": "Specialized / Modern",
    "description": "Object-oriented, statically typed language for writing Ethereum smart contracts on the EVM.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "smart-contracts",
        "title": "Smart Contract Development",
        "topics": [
          {
            "id": "contracts-evm",
            "title": "Contracts, State Variables & Functions",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Solidity Documentation",
                "referenceUrl": "https://docs.soliditylang.org/",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "lua",
    "name": "Lua",
    "slug": "lua",
    "aliases": [
      "lua",
      "neovim"
    ],
    "category": "Scripting / Shell",
    "description": "Lightweight, embeddable scripting language.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "Lua Overview & Architecture",
        "topics": [
          {
            "id": "lua-getting-started",
            "title": "Lua Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Lua Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/Lua_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "perl",
    "name": "Perl",
    "slug": "perl",
    "aliases": [
      "perl",
      "pl"
    ],
    "category": "Scripting / Shell",
    "description": "Highly capable, feature-rich programming language with over 36 years of development.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "Perl Overview & Architecture",
        "topics": [
          {
            "id": "perl-getting-started",
            "title": "Perl Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Perl Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/Perl_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "julia",
    "name": "Julia",
    "slug": "julia",
    "aliases": [
      "julia",
      "jl"
    ],
    "category": "General-purpose",
    "description": "High-performance dynamic language for technical computing.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "Julia Overview & Architecture",
        "topics": [
          {
            "id": "julia-getting-started",
            "title": "Julia Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Julia Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/Julia_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "objective-c",
    "name": "Objective-C",
    "slug": "objective-c",
    "aliases": [
      "objc",
      "objective-c"
    ],
    "category": "Mobile",
    "description": "General-purpose, object-oriented language that adds Smalltalk-style messaging to C.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "Objective-C Overview & Architecture",
        "topics": [
          {
            "id": "objective-c-getting-started",
            "title": "Objective-C Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Objective-C Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/Objective-C_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "groovy",
    "name": "Groovy",
    "slug": "groovy",
    "aliases": [
      "groovy",
      "gradle"
    ],
    "category": "General-purpose",
    "description": "Powerful, optionally typed and dynamic language for the Apache JVM platform.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "Groovy Overview & Architecture",
        "topics": [
          {
            "id": "groovy-getting-started",
            "title": "Groovy Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Groovy Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/Groovy_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "matlab",
    "name": "MATLAB",
    "slug": "matlab",
    "aliases": [
      "matlab",
      "mathworks"
    ],
    "category": "General-purpose",
    "description": "Programming and numeric computing platform used by engineers and scientists.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "MATLAB Overview & Architecture",
        "topics": [
          {
            "id": "matlab-getting-started",
            "title": "MATLAB Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "MATLAB Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/MATLAB_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "visual-basic",
    "name": "Visual Basic",
    "slug": "visual-basic",
    "aliases": [
      "vb",
      "vbnet",
      "visual-basic"
    ],
    "category": "General-purpose",
    "description": "Object-oriented programming language implemented on .NET.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "Visual Basic Overview & Architecture",
        "topics": [
          {
            "id": "visual-basic-getting-started",
            "title": "Visual Basic Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Visual Basic Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/Visual_Basic_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "zig",
    "name": "Zig",
    "slug": "zig",
    "aliases": [
      "zig",
      "ziglang"
    ],
    "category": "Systems / Low-level",
    "description": "General-purpose systems language maintaining readable, optimal code with no hidden control flow.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "Zig Overview & Architecture",
        "topics": [
          {
            "id": "zig-getting-started",
            "title": "Zig Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Zig Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/Zig_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "fortran",
    "name": "Fortran",
    "slug": "fortran",
    "aliases": [
      "fortran",
      "f90"
    ],
    "category": "Systems / Low-level",
    "description": "General-purpose, compiled imperative language especially suited to numeric computation.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "Fortran Overview & Architecture",
        "topics": [
          {
            "id": "fortran-getting-started",
            "title": "Fortran Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Fortran Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/Fortran_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "plsql",
    "name": "PL/SQL",
    "slug": "plsql",
    "aliases": [
      "plsql",
      "oracle-sql"
    ],
    "category": "Database / Query",
    "description": "Procedural Extension to SQL by Oracle for building robust database logic.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "PL/SQL Overview & Architecture",
        "topics": [
          {
            "id": "plsql-getting-started",
            "title": "PL/SQL Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "PL/SQL Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/PL/SQL_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "tsql",
    "name": "T-SQL",
    "slug": "tsql",
    "aliases": [
      "tsql",
      "mssql"
    ],
    "category": "Database / Query",
    "description": "Transact-SQL extension for Microsoft SQL Server.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "T-SQL Overview & Architecture",
        "topics": [
          {
            "id": "tsql-getting-started",
            "title": "T-SQL Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "T-SQL Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/T-SQL_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "cuda",
    "name": "CUDA",
    "slug": "cuda",
    "aliases": [
      "cuda",
      "nvidia",
      "gpu"
    ],
    "category": "Specialized / Modern",
    "description": "Parallel computing platform and programming model developed by NVIDIA.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "CUDA Overview & Architecture",
        "topics": [
          {
            "id": "cuda-getting-started",
            "title": "CUDA Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "CUDA Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/CUDA_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "haskell",
    "name": "Haskell",
    "slug": "haskell",
    "aliases": [
      "haskell",
      "hs"
    ],
    "category": "Specialized / Modern",
    "description": "Advanced, purely functional programming language with strong static typing.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "Haskell Overview & Architecture",
        "topics": [
          {
            "id": "haskell-getting-started",
            "title": "Haskell Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Haskell Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/Haskell_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "erlang",
    "name": "Erlang",
    "slug": "erlang",
    "aliases": [
      "erlang",
      "beam"
    ],
    "category": "Specialized / Modern",
    "description": "Language used to build massively scalable soft real-time systems.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "Erlang Overview & Architecture",
        "topics": [
          {
            "id": "erlang-getting-started",
            "title": "Erlang Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Erlang Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/Erlang_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "elixir",
    "name": "Elixir",
    "slug": "elixir",
    "aliases": [
      "elixir",
      "ex",
      "phoenix"
    ],
    "category": "Specialized / Modern",
    "description": "Dynamic, functional language designed for building scalable and maintainable applications.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "Elixir Overview & Architecture",
        "topics": [
          {
            "id": "elixir-getting-started",
            "title": "Elixir Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Elixir Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/Elixir_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "fsharp",
    "name": "F#",
    "slug": "fsharp",
    "aliases": [
      "f#",
      "fsharp",
      "dotnet-fsharp"
    ],
    "category": "Specialized / Modern",
    "description": "Universal programming language for writing succinct, robust, and performant code.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "F# Overview & Architecture",
        "topics": [
          {
            "id": "fsharp-getting-started",
            "title": "F# Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "F# Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/F#_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "clojure",
    "name": "Clojure",
    "slug": "clojure",
    "aliases": [
      "clojure",
      "clj"
    ],
    "category": "Specialized / Modern",
    "description": "Dynamic, general-purpose programming language, combining Lisp and JVM agility.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "Clojure Overview & Architecture",
        "topics": [
          {
            "id": "clojure-getting-started",
            "title": "Clojure Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Clojure Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/Clojure_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "lisp",
    "name": "Lisp",
    "slug": "lisp",
    "aliases": [
      "lisp",
      "common-lisp"
    ],
    "category": "Specialized / Modern",
    "description": "Family of programming languages with a long history and a distinctive syntax.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "Lisp Overview & Architecture",
        "topics": [
          {
            "id": "lisp-getting-started",
            "title": "Lisp Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Lisp Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/Lisp_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "prolog",
    "name": "Prolog",
    "slug": "prolog",
    "aliases": [
      "prolog",
      "logic"
    ],
    "category": "Specialized / Modern",
    "description": "Logic programming language associated with AI and computational linguistics.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "Prolog Overview & Architecture",
        "topics": [
          {
            "id": "prolog-getting-started",
            "title": "Prolog Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Prolog Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/Prolog_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "ada",
    "name": "Ada",
    "slug": "ada",
    "aliases": [
      "ada",
      "defense"
    ],
    "category": "Specialized / Modern",
    "description": "Structured, statically typed, imperative, and object-oriented high-level language.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "Ada Overview & Architecture",
        "topics": [
          {
            "id": "ada-getting-started",
            "title": "Ada Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Ada Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/Ada_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "cobol",
    "name": "COBOL",
    "slug": "cobol",
    "aliases": [
      "cobol",
      "legacy",
      "mainframe"
    ],
    "category": "Specialized / Modern",
    "description": "Compiled English-like computer programming language designed for business use.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "COBOL Overview & Architecture",
        "topics": [
          {
            "id": "cobol-getting-started",
            "title": "COBOL Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "COBOL Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/COBOL_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "crystal",
    "name": "Crystal",
    "slug": "crystal",
    "aliases": [
      "crystal",
      "cr"
    ],
    "category": "Specialized / Modern",
    "description": "Language with Ruby-inspired syntax that compiles to efficient native code.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "Crystal Overview & Architecture",
        "topics": [
          {
            "id": "crystal-getting-started",
            "title": "Crystal Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Crystal Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/Crystal_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "nim",
    "name": "Nim",
    "slug": "nim",
    "aliases": [
      "nim",
      "nimlang"
    ],
    "category": "Specialized / Modern",
    "description": "Statically typed compiled systems programming language with expressive syntax.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "Nim Overview & Architecture",
        "topics": [
          {
            "id": "nim-getting-started",
            "title": "Nim Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Nim Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/Nim_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "v",
    "name": "V",
    "slug": "v",
    "aliases": [
      "vlang",
      "v"
    ],
    "category": "Specialized / Modern",
    "description": "Simple, fast, safe, compiled language for developing maintainable software.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "V Overview & Architecture",
        "topics": [
          {
            "id": "v-getting-started",
            "title": "V Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "V Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/V_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "ocaml",
    "name": "OCaml",
    "slug": "ocaml",
    "aliases": [
      "ocaml",
      "ml"
    ],
    "category": "Specialized / Modern",
    "description": "Industrial-strength functional programming language with expressive type system.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "OCaml Overview & Architecture",
        "topics": [
          {
            "id": "ocaml-getting-started",
            "title": "OCaml Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "OCaml Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/OCaml_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "d",
    "name": "D",
    "slug": "d",
    "aliases": [
      "dlang",
      "d"
    ],
    "category": "Specialized / Modern",
    "description": "General-purpose systems language with C-like syntax and static typing.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "D Overview & Architecture",
        "topics": [
          {
            "id": "d-getting-started",
            "title": "D Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "D Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/D_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "apex",
    "name": "Apex",
    "slug": "apex",
    "aliases": [
      "apex",
      "salesforce"
    ],
    "category": "Specialized / Modern",
    "description": "Strongly typed, object-oriented programming language for the Salesforce platform.",
    "isPopular": false,
    "searchable": true,
    "status": "active",
    "modules": [
      {
        "id": "overview",
        "title": "Apex Overview & Architecture",
        "topics": [
          {
            "id": "apex-getting-started",
            "title": "Apex Getting Started & Syntax",
            "externalReferences": [
              {
                "sourceName": "Official Documentation",
                "referenceTitle": "Apex Official Documentation & Language Guide",
                "referenceUrl": "https://en.wikipedia.org/wiki/Apex_(programming_language)",
                "isPrimary": true
              }
            ]
          }
        ]
      }
    ]
  }
];

export const POPULAR_LANGUAGE_SLUGS = [
  'java', 'python', 'cpp', 'javascript', 'sql', 'typescript', 'golang', 'rust', 'csharp', 'c', 'html', 'css', 'kotlin', 'php'
];

export const LANGUAGE_CATEGORIES = [
  'All',
  'General-purpose',
  'Web',
  'Systems / Low-level',
  'Database / Query',
  'Mobile',
  'Scripting / Shell',
  'Specialized / Modern'
] as const;
