import type { CareerRoleDefinition } from '../types/careerConnect';

export const CAREER_ROLES: CareerRoleDefinition[] = [
  {
    "id": "backend-developer",
    "title": "Backend Developer",
    "category": "Development",
    "shortDescription": "Designs, constructs, and optimizes scalable server-side systems, APIs, and data architectures.",
    "overview": "Backend developers are responsible for server-side web application logic, database integrations, REST/gRPC API architecture, authentication mechanisms, and system performance at scale.",
    "basicRequirements": [
      "Programming Fundamentals (Data types, control flow, functions, OOP)",
      "Relational Database Basics & SQL queries (CRUD, Joins, Group By)",
      "HTTP / HTTPS protocols, status codes, and headers",
      "Version Control with Git (branching, commits, pull requests)",
      "Basic API creation (GET/POST endpoints, JSON payloads)"
    ],
    "intermediateRequirements": [
      "Production RESTful API design, rate-limiting, and validation",
      "Backend Frameworks (Spring Boot / Express / FastAPI / Django / NestJS)",
      "Authentication & Authorization (JWT, OAuth2, Session cookies, RBAC)",
      "Relational Database Modeling, Schema Normalization, and ORMs",
      "Unit & Integration Testing (JUnit / PyTest / Jest / Mocking)"
    ],
    "advancedRequirements": [
      "Distributed Caching strategies (Redis, Memcached, Cache-aside pattern)",
      "Asynchronous Messaging & Queues (Kafka, RabbitMQ, Celery)",
      "Database Performance Optimization (B-Tree indexes, query execution plans, transactions & ACID)",
      "Containerization & Orchestration (Docker, Docker Compose, Kubernetes basics)",
      "High-Level System Design & Microservices Architecture"
    ],
    "industryReadyRequirements": [
      "End-to-end production deployment with CI/CD pipelines (GitHub Actions / Jenkins)",
      "Observability, Structured Logging, and Distributed Tracing (Prometheus, Grafana, OpenTelemetry)",
      "Zero-downtime database migrations & idempotency in payment/order flows",
      "Concurrency control, race condition mitigation, and thread-safety",
      "System design interview mastery (Rate limiters, URL shorteners, Chat systems)"
    ],
    "recommendedLanguages": [
      "Java",
      "Python",
      "Go",
      "TypeScript",
      "C#"
    ],
    "recommendedTechnologies": [
      "Spring Boot",
      "FastAPI",
      "Node.js",
      "PostgreSQL",
      "Redis",
      "Docker",
      "Kafka"
    ],
    "commonCombinations": [
      {
        "combo": "Java + Spring Boot + PostgreSQL + Redis",
        "description": "Standard enterprise backend architecture for high-throughput banking and fintech."
      },
      {
        "combo": "Python + FastAPI / Django + PostgreSQL + Celery",
        "description": "Modern, high-velocity backend ideal for AI-integrated systems, data platforms, and SaaS."
      },
      {
        "combo": "TypeScript + Node.js / NestJS + MongoDB / Postgres",
        "description": "Full-stack unified language ecosystem ideal for rapid startups and real-time event applications."
      },
      {
        "combo": "Go + Gin / Fiber + PostgreSQL + gRPC",
        "description": "Ultra-low latency microservices stack common in high-concurrency cloud infrastructure."
      }
    ],
    "requiredSkills": [
      {
        "skill": "Java",
        "level": "Intermediate",
        "category": "Language",
        "isCore": true
      },
      {
        "skill": "Python",
        "level": "Intermediate",
        "category": "Language",
        "isCore": true
      },
      {
        "skill": "SQL",
        "level": "Advanced",
        "category": "Database",
        "isCore": true
      },
      {
        "skill": "Git",
        "level": "Basic",
        "category": "Tool",
        "isCore": true
      },
      {
        "skill": "REST APIs",
        "level": "Intermediate",
        "category": "Concept",
        "isCore": true
      },
      {
        "skill": "Docker",
        "level": "Intermediate",
        "category": "Tool",
        "isCore": false
      },
      {
        "skill": "System Design",
        "level": "Advanced",
        "category": "Concept",
        "isCore": false
      }
    ],
    "learningPathModules": [
      {
        "language": "Java",
        "module": "java-oop",
        "topic": "classes-objects"
      },
      {
        "language": "Java",
        "module": "java-oop",
        "topic": "inheritance"
      },
      {
        "language": "SQL",
        "module": "sql-joins",
        "topic": "joins-execution"
      },
      {
        "language": "SQL",
        "module": "sql-indexing",
        "topic": "composite-index-prefix"
      },
      {
        "language": "Python",
        "module": "python-fundamentals",
        "topic": "mutability-references"
      }
    ]
  },
  {
    "id": "frontend-developer",
    "title": "Frontend Developer",
    "category": "Development",
    "shortDescription": "Builds responsive, accessible, interactive web interfaces and client-side web applications.",
    "overview": "Frontend engineers specialize in browser execution, reactive UI component architecture, state management, web performance optimization, accessibility (a11y), and API consumption.",
    "basicRequirements": [
      "Semantic HTML5 elements and structured document outline",
      "CSS3 styling, Box Model, Flexbox, and CSS Grid layouts",
      "JavaScript ES6+ fundamentals (arrow functions, destructuring, promises, array methods)",
      "DOM manipulation, event handling, and event delegation",
      "Git fundamentals and responsive design using media queries"
    ],
    "intermediateRequirements": [
      "Modern Component Frameworks (React, Vue, or Angular)",
      "TypeScript typing, interfaces, generics, and compile checks",
      "State Management (Zustand, Redux Toolkit, Context API, TanStack Query)",
      "REST & GraphQL client integration, async data fetching, error handling",
      "CSS Modern Tools (Tailwind CSS, CSS Modules, styled-components)"
    ],
    "advancedRequirements": [
      "Server-Side Rendering & Meta-frameworks (Next.js, Remix, Astro)",
      "Core Web Vitals Optimization (LCP, FID/INP, CLS, bundle splitting)",
      "Browser Internals (Critical Rendering Path, repaint/reflow minimization, Web Workers)",
      "Automated Testing (Vitest, React Testing Library, Playwright E2E)",
      "Accessibility compliance (WCAG 2.1 AA standards, ARIA attributes, keyboard navigation)"
    ],
    "industryReadyRequirements": [
      "Micro-frontends architecture and module federation",
      "Design systems and component library maintenance with Storybook",
      "Edge rendering, ISR (Incremental Static Regeneration), and CDN caching strategies",
      "Frontend telemetry, error tracking with Sentry, and user session monitoring",
      "Complex client-side performance profiling using Chrome DevTools Performance panel"
    ],
    "recommendedLanguages": [
      "JavaScript",
      "TypeScript"
    ],
    "recommendedTechnologies": [
      "React",
      "Next.js",
      "Tailwind CSS",
      "TypeScript",
      "Vite",
      "Zustand",
      "Playwright"
    ],
    "commonCombinations": [
      {
        "combo": "TypeScript + React + Next.js + Tailwind CSS",
        "description": "The gold-standard enterprise frontend stack with static/SSR performance and high maintainability."
      },
      {
        "combo": "TypeScript + Vue 3 + Nuxt + Pinia",
        "description": "Fast, approachable reactive framework widely used across SaaS and e-commerce platforms."
      },
      {
        "combo": "JavaScript + HTML5/CSS3 + Vite + Redux Toolkit",
        "description": "Classic SPA foundation powering millions of commercial dashboards."
      }
    ],
    "requiredSkills": [
      {
        "skill": "JavaScript",
        "level": "Advanced",
        "category": "Language",
        "isCore": true
      },
      {
        "skill": "TypeScript",
        "level": "Intermediate",
        "category": "Language",
        "isCore": true
      },
      {
        "skill": "React",
        "level": "Intermediate",
        "category": "Framework",
        "isCore": true
      },
      {
        "skill": "HTML5 / CSS3",
        "level": "Advanced",
        "category": "Frontend",
        "isCore": true
      },
      {
        "skill": "Tailwind CSS",
        "level": "Intermediate",
        "category": "Frontend",
        "isCore": false
      },
      {
        "skill": "Web Performance",
        "level": "Intermediate",
        "category": "Concept",
        "isCore": false
      }
    ],
    "learningPathModules": [
      {
        "language": "JavaScript",
        "module": "js-closures",
        "topic": "scope-closures"
      },
      {
        "language": "JavaScript",
        "module": "js-async",
        "topic": "promise-combinators"
      },
      {
        "language": "JavaScript",
        "module": "react-core",
        "topic": "fiber-reconciliation"
      }
    ]
  },
  {
    "id": "fullstack-developer",
    "title": "Full Stack Developer",
    "category": "Development",
    "shortDescription": "Delivers complete software solutions spanning user interface, server logic, database design, and cloud hosting.",
    "overview": "Full Stack Engineers possess the versatility to take a product from zero to one. They design database schemas, construct scalable backend services, build interactive frontends, and configure CI/CD deployments.",
    "basicRequirements": [
      "HTML5, CSS3, Modern JavaScript ES6+",
      "Backend language basics (Node.js/Express, Python/FastAPI, or Java/Spring)",
      "Relational Database queries with SQL (SELECT, INSERT, UPDATE, DELETE, JOIN)",
      "RESTful API design and JSON serialization",
      "Git version control and collaborative workflows"
    ],
    "intermediateRequirements": [
      "Modern Frontend Framework (React, Next.js, or Vue)",
      "Strong TypeScript across both frontend and backend codebases",
      "Database schema design, foreign keys, migrations, and ORM usage (Prisma, TypeORM, SQLAlchemy)",
      "Authentication flows (JWT, Session cookies, Refresh tokens, OAuth)",
      "Unit and integration testing on both client and server tiers"
    ],
    "advancedRequirements": [
      "Server-Side Rendering (SSR) and full-stack frameworks (Next.js App Router, Remix)",
      "Caching strategies with Redis for session data and API responses",
      "Containerization of full-stack services using Docker & Docker Compose",
      "Database indexing, query plan analysis, and performance tuning",
      "Real-time communication using WebSockets (Socket.io or native WS)"
    ],
    "industryReadyRequirements": [
      "Cloud deployment on AWS, Vercel, or GCP with automated CI/CD pipelines",
      "Microservices vs Modular Monolith architectural decision making",
      "Security best practices (OWASP Top 10, CORS, CSP, input sanitization, rate limiting)",
      "Full-stack observability with centralized logging and metric tracking",
      "Independent feature ownership from requirements gathering to production release"
    ],
    "recommendedLanguages": [
      "TypeScript",
      "JavaScript",
      "Python",
      "Java",
      "SQL"
    ],
    "recommendedTechnologies": [
      "Next.js",
      "React",
      "Node.js",
      "Express",
      "PostgreSQL",
      "Prisma",
      "Docker",
      "Tailwind CSS"
    ],
    "commonCombinations": [
      {
        "combo": "TypeScript + Next.js + PostgreSQL + Prisma + Tailwind",
        "description": "Modern unified full-stack architecture with end-to-end type safety and rapid time to market."
      },
      {
        "combo": "React + Python FastAPI + PostgreSQL + Docker",
        "description": "High-velocity stack ideal for data-intensive and AI-driven applications."
      },
      {
        "combo": "React + Java Spring Boot + MySQL + Redis",
        "description": "Enterprise full-stack standard for financial, enterprise SaaS, and compliance-driven platforms."
      }
    ],
    "requiredSkills": [
      {
        "skill": "JavaScript",
        "level": "Advanced",
        "category": "Language",
        "isCore": true
      },
      {
        "skill": "TypeScript",
        "level": "Intermediate",
        "category": "Language",
        "isCore": true
      },
      {
        "skill": "React",
        "level": "Intermediate",
        "category": "Framework",
        "isCore": true
      },
      {
        "skill": "Node.js",
        "level": "Intermediate",
        "category": "Backend",
        "isCore": true
      },
      {
        "skill": "SQL",
        "level": "Intermediate",
        "category": "Database",
        "isCore": true
      },
      {
        "skill": "Docker",
        "level": "Basic",
        "category": "DevOps",
        "isCore": false
      }
    ],
    "learningPathModules": [
      {
        "language": "JavaScript",
        "module": "js-closures",
        "topic": "scope-closures"
      },
      {
        "language": "SQL",
        "module": "sql-joins",
        "topic": "joins-execution"
      },
      {
        "language": "Python",
        "module": "python-fundamentals",
        "topic": "mutability-references"
      }
    ]
  },
  {
    "id": "ai-ml-engineer",
    "title": "AI / Machine Learning Engineer",
    "category": "AI / Data",
    "shortDescription": "Develops, fine-tunes, evaluates, and deploys machine learning models and generative AI systems into production.",
    "overview": "AI/ML Engineers bridge the gap between machine learning research and scalable software engineering. They build data preprocessing pipelines, fine-tune foundation models, implement RAG systems, and deploy low-latency inference microservices.",
    "basicRequirements": [
      "Python mastery (data structures, OOP, list comprehensions, generators)",
      "Linear Algebra, Calculus, Probability, and Statistics fundamentals",
      "Data manipulation with NumPy (vectorization, broadcasting) and Pandas (DataFrames)",
      "Supervised vs Unsupervised learning algorithms (Regression, Classification, Clustering)",
      "Model evaluation metrics (Accuracy, Precision, Recall, F1, ROC-AUC, MSE)"
    ],
    "intermediateRequirements": [
      "Deep Learning fundamentals with PyTorch or TensorFlow (Tensors, Autograd, Backpropagation)",
      "Neural Network architectures (CNNs, RNNs/LSTMs, Transformers)",
      "Feature engineering, categorical encoding, scaling, and cross-validation techniques",
      "Natural Language Processing basics (tokenization, embeddings, word2vec)",
      "Experiment tracking with MLflow, Weights & Biases, or TensorBoard"
    ],
    "advancedRequirements": [
      "Transformer Architecture deep-dive (Self-Attention, Multi-Head Attention, Positional Encodings)",
      "Generative AI & LLM Engineering (LangChain, LlamaIndex, Vector Databases like Pinecone/Chroma/pgvector)",
      "Retrieval-Augmented Generation (RAG) pipeline design with re-ranking and semantic chunking",
      "Fine-tuning techniques (LoRA, QLoRA, PEFT) on open-weight models (Llama 3, Mistral)",
      "Model quantization (GGUF, AWQ, bitsandbytes) and inference optimization (vLLM, Ollama, ONNX Runtime)"
    ],
    "industryReadyRequirements": [
      "Production ML serving with FastAPI, Triton Inference Server, or TorchServe",
      "MLOps pipelines for continuous training, automated testing, and model registry",
      "Monitoring data drift, model decay, and hallucination evaluation frameworks (RAGAS, Trulens)",
      "Distributed training across multi-GPU clusters using PyTorch DDP / DeepSpeed",
      "AI safety, prompt injection defenses, PII masking, and ethical alignment"
    ],
    "recommendedLanguages": [
      "Python",
      "C++",
      "SQL"
    ],
    "recommendedTechnologies": [
      "PyTorch",
      "Hugging Face",
      "LangChain",
      "FastAPI",
      "vLLM",
      "Docker",
      "pgvector"
    ],
    "commonCombinations": [
      {
        "combo": "Python + PyTorch + Hugging Face + FastAPI + Docker",
        "description": "Industry standard for custom model development, fine-tuning, and production API serving."
      },
      {
        "combo": "Python + LangChain / LlamaIndex + pgvector + OpenAI / Claude API",
        "description": "Leading architecture for enterprise RAG, agentic workflows, and semantic document intelligence."
      },
      {
        "combo": "Python + vLLM + Triton + Kubernetes + Prometheus",
        "description": "High-throughput, GPU-optimized inference cluster architecture for large-scale LLM deployments."
      }
    ],
    "requiredSkills": [
      {
        "skill": "Python",
        "level": "Advanced",
        "category": "Language",
        "isCore": true
      },
      {
        "skill": "Machine Learning",
        "level": "Intermediate",
        "category": "Concept",
        "isCore": true
      },
      {
        "skill": "PyTorch",
        "level": "Intermediate",
        "category": "Framework",
        "isCore": true
      },
      {
        "skill": "SQL",
        "level": "Intermediate",
        "category": "Database",
        "isCore": true
      },
      {
        "skill": "Docker",
        "level": "Basic",
        "category": "DevOps",
        "isCore": false
      },
      {
        "skill": "LLM Engineering",
        "level": "Intermediate",
        "category": "AI",
        "isCore": false
      }
    ],
    "learningPathModules": [
      {
        "language": "Python",
        "module": "python-datascience",
        "topic": "numpy-vectorization"
      },
      {
        "language": "Python",
        "module": "python-asyncio",
        "topic": "event-loop-coroutines"
      },
      {
        "language": "Python",
        "module": "python-fastapi",
        "topic": "fastapi-dependency-injection"
      }
    ]
  },
  {
    "id": "data-scientist",
    "title": "Data Scientist",
    "category": "AI / Data",
    "shortDescription": "Extracts actionable insights, builds statistical predictive models, and translates complex data into executive decisions.",
    "overview": "Data Scientists combine statistical rigor, machine learning modeling, and domain expertise to discover patterns in massive datasets, predict trends, and guide strategic organizational decision-making.",
    "basicRequirements": [
      "Python or R for exploratory data analysis (EDA)",
      "Strong foundation in Probability, Hypothesis Testing (p-values, t-tests, ANOVA), and Confidence Intervals",
      "Data wrangling with Pandas, NumPy, and clean data pipeline construction",
      "Data visualization using Matplotlib, Seaborn, or Plotly",
      "Advanced SQL querying (aggregations, window functions, CTEs)"
    ],
    "intermediateRequirements": [
      "Scikit-learn algorithms (Random Forests, Gradient Boosting, XGBoost, LightGBM)",
      "Dimensionality reduction techniques (PCA, t-SNE, UMAP)",
      "A/B Testing methodology, power analysis, sample size determination, and bias control",
      "Feature engineering, imputation, handling class imbalance (SMOTE, class weights)",
      "Dashboard creation using Streamlit, Dash, or Power BI / Tableau"
    ],
    "advancedRequirements": [
      "Time-Series Forecasting (ARIMA, Prophet, LSTM, Chronos)",
      "Causal Inference and counterfactual analysis (DoWhy, Propensity Score Matching)",
      "Big Data processing with PySpark on distributed clusters (Databricks, AWS EMR)",
      "Deep learning for tabular and unstructured multimodal data",
      "Model explainability (SHAP values, LIME, feature importance diagnostics)"
    ],
    "industryReadyRequirements": [
      "End-to-end data product development from stakeholder discovery to model deployment",
      "Automated feature stores (Feast) and production prediction pipelines",
      "Executive storytelling: communicating complex statistical findings clearly to business leaders",
      "Data governance, privacy compliance (GDPR/HIPAA), and algorithmic fairness audits"
    ],
    "recommendedLanguages": [
      "Python",
      "SQL",
      "R"
    ],
    "recommendedTechnologies": [
      "Pandas",
      "Scikit-Learn",
      "XGBoost",
      "PySpark",
      "PostgreSQL",
      "Streamlit",
      "MLflow"
    ],
    "commonCombinations": [
      {
        "combo": "Python + Pandas + Scikit-Learn + XGBoost + SQL",
        "description": "Core professional data science toolkit powering predictive analytics across all industries."
      },
      {
        "combo": "Python + PySpark + Databricks + Delta Lake",
        "description": "Enterprise big-data science stack for analyzing terabyte-to-petabyte scale datasets."
      }
    ],
    "requiredSkills": [
      {
        "skill": "Python",
        "level": "Advanced",
        "category": "Language",
        "isCore": true
      },
      {
        "skill": "SQL",
        "level": "Advanced",
        "category": "Database",
        "isCore": true
      },
      {
        "skill": "Data Analysis",
        "level": "Advanced",
        "category": "Concept",
        "isCore": true
      },
      {
        "skill": "Machine Learning",
        "level": "Intermediate",
        "category": "Concept",
        "isCore": true
      },
      {
        "skill": "Statistics",
        "level": "Advanced",
        "category": "Concept",
        "isCore": true
      }
    ],
    "learningPathModules": [
      {
        "language": "Python",
        "module": "python-datascience",
        "topic": "numpy-vectorization"
      },
      {
        "language": "SQL",
        "module": "sql-window-functions",
        "topic": "rank-lead-lag"
      },
      {
        "language": "SQL",
        "module": "sql-aggregations",
        "topic": "where-vs-having"
      }
    ]
  },
  {
    "id": "java-developer",
    "title": "Java / Spring Boot Developer",
    "category": "Enterprise",
    "shortDescription": "Engineers robust, high-throughput enterprise backend services using Java, Spring Boot, and cloud ecosystems.",
    "overview": "Java developers architect mission-critical enterprise systems, banking engines, e-commerce backends, and microservice clusters running on the JVM with guaranteed type safety and durability.",
    "basicRequirements": [
      "Core Java syntax, OOP (Encapsulation, Inheritance, Polymorphism, Abstraction)",
      "Java Collections Framework (List, Set, Map, Queue, Iterator)",
      "Exception handling (Checked vs Unchecked, try-catch-finally)",
      "Basic multithreading concepts (Thread class, Runnable, synchronization)",
      "Build tools: Maven or Gradle project structure and dependency management"
    ],
    "intermediateRequirements": [
      "Spring Boot framework (Controllers, Services, Repositories, Dependency Injection)",
      "Spring Data JPA & Hibernate ORM (Entity mapping, JPQL, relationships)",
      "Database integration with PostgreSQL / MySQL, transactions (@Transactional)",
      "Unit testing with JUnit 5 and Mockito",
      "RESTful API design and OpenAPI / Swagger documentation"
    ],
    "advancedRequirements": [
      "Spring Security with JWT authentication and Role-Based Access Control (RBAC)",
      "JVM internals: Memory management (Heap, Stack, Metaspace), Garbage Collection tuning (G1, ZGC)",
      "Asynchronous processing and event-driven architecture with Apache Kafka or RabbitMQ",
      "Performance optimization: connection pooling with HikariCP, caching with Redis",
      "Microservice patterns: Service discovery (Eureka/Consul), API Gateway, resilience with Resilience4j"
    ],
    "industryReadyRequirements": [
      "Modern Java features (Java 17 / 21 LTS: Records, Sealed Classes, Pattern Matching, Virtual Threads)",
      "Containerization with Docker and Kubernetes deployment manifests",
      "Production observability with Spring Boot Actuator, Micrometer, and Prometheus",
      "High-concurrency tuning and thread-safety under heavy parallel load"
    ],
    "recommendedLanguages": [
      "Java",
      "SQL"
    ],
    "recommendedTechnologies": [
      "Spring Boot",
      "Hibernate",
      "PostgreSQL",
      "Kafka",
      "Docker",
      "Redis",
      "JUnit 5"
    ],
    "commonCombinations": [
      {
        "combo": "Java 21 + Spring Boot 3 + PostgreSQL + Docker",
        "description": "State-of-the-art modern enterprise microservice architecture with virtual threads."
      }
    ],
    "requiredSkills": [
      {
        "skill": "Java",
        "level": "Advanced",
        "category": "Language",
        "isCore": true
      },
      {
        "skill": "Spring Boot",
        "level": "Advanced",
        "category": "Framework",
        "isCore": true
      },
      {
        "skill": "SQL",
        "level": "Advanced",
        "category": "Database",
        "isCore": true
      },
      {
        "skill": "Hibernate",
        "level": "Intermediate",
        "category": "ORM",
        "isCore": true
      },
      {
        "skill": "Docker",
        "level": "Basic",
        "category": "DevOps",
        "isCore": false
      }
    ],
    "learningPathModules": [
      {
        "language": "Java",
        "module": "java-oop",
        "topic": "inheritance"
      },
      {
        "language": "Java",
        "module": "java-collections",
        "topic": "hashmap-internals"
      },
      {
        "language": "Java",
        "module": "java-spring-core",
        "topic": "spring-di-ioc"
      }
    ]
  },
  {
    "id": "python-developer",
    "title": "Python Developer",
    "category": "Development",
    "shortDescription": "Builds high-velocity web services, automation engines, ETL data pipelines, and API platforms in Python.",
    "overview": "Python Developers leverage Python's rich ecosystem to build modular web applications, automate infrastructure workflows, design data scrapers and pipelines, and integrate generative AI capabilities.",
    "basicRequirements": [
      "Python data types, mutability, references, dicts, lists, sets, tuples",
      "Control flow, comprehensions, and Pythonic coding idioms (PEP 8)",
      "Functions: *args, **kwargs, lambda expressions, scope (LEGB rule)",
      "Object-oriented Python: classes, __init__, methods, inheritance",
      "Virtual environment management (venv, pip, poetry)"
    ],
    "intermediateRequirements": [
      "Web frameworks: FastAPI, Django, or Flask",
      "Database integration with SQLAlchemy or Django ORM",
      "Unit testing with PyTest, fixtures, and mocking",
      "Asynchronous programming with asyncio, async/await, and async HTTP clients (httpx)",
      "Data parsing, JSON manipulation, and RESTful API client integration"
    ],
    "advancedRequirements": [
      "Pydantic V2 data validation and settings management",
      "Background task processing with Celery and Redis",
      "CPython internals: GIL mechanics, reference counting, and cyclic garbage collection",
      "Advanced OOP: dunder methods, descriptors, decorators with functools.wraps, metaclasses",
      "Performance profiling with cProfile, line_profiler, and memory_profiler"
    ],
    "industryReadyRequirements": [
      "Production ASGI deployments with Uvicorn/Gunicorn behind Nginx",
      "Type hinting with strict Mypy static analysis compliance",
      "Microservice event-driven architecture using Kafka or RabbitMQ",
      "Automated CI/CD with GitHub Actions, linting with Ruff, and formatting with Black"
    ],
    "recommendedLanguages": [
      "Python",
      "SQL"
    ],
    "recommendedTechnologies": [
      "FastAPI",
      "Django",
      "PostgreSQL",
      "Docker",
      "Redis",
      "Celery",
      "PyTest"
    ],
    "commonCombinations": [
      {
        "combo": "Python + FastAPI + PostgreSQL + SQLAlchemy 2.0 + Docker",
        "description": "Ultra-fast modern API stack with auto-generated OpenAPI documentation and async performance."
      }
    ],
    "requiredSkills": [
      {
        "skill": "Python",
        "level": "Advanced",
        "category": "Language",
        "isCore": true
      },
      {
        "skill": "FastAPI",
        "level": "Intermediate",
        "category": "Framework",
        "isCore": true
      },
      {
        "skill": "SQL",
        "level": "Intermediate",
        "category": "Database",
        "isCore": true
      },
      {
        "skill": "Docker",
        "level": "Basic",
        "category": "Tool",
        "isCore": false
      }
    ],
    "learningPathModules": [
      {
        "language": "Python",
        "module": "python-fundamentals",
        "topic": "mutability-references"
      },
      {
        "language": "Python",
        "module": "python-oop",
        "topic": "mro-c3-linearization"
      },
      {
        "language": "Python",
        "module": "python-fastapi",
        "topic": "fastapi-dependency-injection"
      }
    ]
  },
  {
    "id": "devops-engineer",
    "title": "DevOps & Cloud Engineer",
    "category": "Infrastructure",
    "shortDescription": "Automates software delivery pipelines, manages cloud infrastructure as code, and guarantees 99.99% availability.",
    "overview": "DevOps engineers design automated CI/CD workflows, manage containerized clusters on Kubernetes, provision cloud infrastructure with Terraform, and maintain system reliability and security.",
    "basicRequirements": [
      "Linux / Unix system administration, bash scripting, file permissions, and process management",
      "Networking fundamentals (DNS, TCP/IP, OSI model, HTTP/HTTPS, SSL/TLS certificates)",
      "Version control workflows with Git and GitHub / GitLab",
      "Docker container creation, Dockerfiles, and multi-stage builds",
      "Cloud fundamentals (Compute instances, Object storage, VPCs)"
    ],
    "intermediateRequirements": [
      "CI/CD pipeline automation (GitHub Actions, GitLab CI, Jenkins)",
      "Infrastructure as Code (IaC) with Terraform or AWS CloudFormation",
      "Container orchestration with Kubernetes (Pods, Deployments, Services, Ingress)",
      "Cloud platform mastery (AWS, GCP, or Azure core services)",
      "Configuration management using Ansible or cloud-init"
    ],
    "advancedRequirements": [
      "Kubernetes production administration: Helm charts, RBAC, CNI networking, storage classes",
      "Service Mesh architecture (Istio, Linkerd) and zero-trust mTLS communication",
      "Observability stacks: Prometheus, Grafana, Loki, OpenTelemetry, ELK / OpenSearch",
      "GitOps deployment pipelines with ArgoCD or Flux",
      "Cloud security hardening, IAM least-privilege policies, secret management (Vault)"
    ],
    "industryReadyRequirements": [
      "Disaster recovery planning, multi-region failover, and automated backups",
      "Cost optimization (FinOps) for cloud compute, reserved instances, and auto-scaling",
      "Chaos Engineering experiments (Chaos Mesh, Gremlin) to test resilience",
      "Compliance automation (SOC2, ISO27001, GDPR security controls in cloud)"
    ],
    "recommendedLanguages": [
      "Bash",
      "Python",
      "Go"
    ],
    "recommendedTechnologies": [
      "Docker",
      "Kubernetes",
      "Terraform",
      "GitHub Actions",
      "AWS",
      "Prometheus",
      "Helm"
    ],
    "commonCombinations": [
      {
        "combo": "Kubernetes + Terraform + AWS + GitHub Actions + Prometheus",
        "description": "The enterprise cloud-native standard for high-availability production workloads."
      }
    ],
    "requiredSkills": [
      {
        "skill": "Linux",
        "level": "Advanced",
        "category": "OS",
        "isCore": true
      },
      {
        "skill": "Docker",
        "level": "Advanced",
        "category": "Container",
        "isCore": true
      },
      {
        "skill": "Kubernetes",
        "level": "Intermediate",
        "category": "Orchestration",
        "isCore": true
      },
      {
        "skill": "Terraform",
        "level": "Intermediate",
        "category": "IaC",
        "isCore": true
      },
      {
        "skill": "CI/CD",
        "level": "Advanced",
        "category": "Automation",
        "isCore": true
      }
    ],
    "learningPathModules": [
      {
        "language": "Bash",
        "module": "bash-pipelines",
        "topic": "streams-exit-codes"
      }
    ]
  },
  {
    "id": "data-engineer",
    "title": "Data Engineer / Big Data Specialist",
    "category": "AI / Data",
    "shortDescription": "Constructs robust data lakes, real-time streaming architectures, and distributed ETL pipelines.",
    "overview": "Data Engineers build scalable data pipelines that ingest, clean, transform, and store petabytes of data from disparate systems into warehouses and lakehouses for downstream analytics and machine learning.",
    "basicRequirements": [
      "Advanced SQL querying, schema modeling (Star and Snowflake schemas)",
      "Python programming for data manipulation and automation",
      "Relational and non-relational database principles (PostgreSQL, MongoDB)",
      "File formats: CSV, JSON, Parquet, Avro, and columnar storage mechanics",
      "Git and basic Linux CLI command mastery"
    ],
    "intermediateRequirements": [
      "Distributed data processing with Apache Spark (PySpark or Scala)",
      "Data workflow orchestration with Apache Airflow or Prefect",
      "Cloud Data Warehouses (Snowflake, Google BigQuery, or Amazon Redshift)",
      "Data transformation frameworks (dbt - data build tool)",
      "Data lake architectures (Delta Lake, Apache Iceberg, Apache Hudi)"
    ],
    "advancedRequirements": [
      "Real-time streaming with Apache Kafka, Spark Streaming, or Apache Flink",
      "Change Data Capture (CDC) with Debezium and Kafka Connect",
      "Data quality frameworks (Great Expectations, Soda) and data contracts",
      "Partitioning, clustering, and performance optimization on petabyte datasets",
      "Data cataloging, metadata management, and lineage tracking"
    ],
    "industryReadyRequirements": [
      "FinOps optimization for big data compute queries and cluster autoscaling",
      "Zero-downtime schema evolution without breaking downstream consumer pipelines",
      "End-to-end data lakehouse deployment on AWS / Databricks"
    ],
    "recommendedLanguages": [
      "Python",
      "SQL",
      "Scala",
      "Java"
    ],
    "recommendedTechnologies": [
      "Apache Spark",
      "Airflow",
      "Kafka",
      "Snowflake",
      "dbt",
      "PostgreSQL",
      "Docker"
    ],
    "commonCombinations": [
      {
        "combo": "Python + PySpark + Apache Airflow + Snowflake + dbt",
        "description": "Leading modern enterprise data stack for scalable batch ETL and analytical warehouses."
      }
    ],
    "requiredSkills": [
      {
        "skill": "SQL",
        "level": "Advanced",
        "category": "Database",
        "isCore": true
      },
      {
        "skill": "Python",
        "level": "Advanced",
        "category": "Language",
        "isCore": true
      },
      {
        "skill": "Spark",
        "level": "Intermediate",
        "category": "Big Data",
        "isCore": true
      },
      {
        "skill": "Airflow",
        "level": "Intermediate",
        "category": "Pipeline",
        "isCore": true
      }
    ],
    "learningPathModules": [
      {
        "language": "SQL",
        "module": "sql-partitioning",
        "topic": "table-partitioning-pruning"
      },
      {
        "language": "SQL",
        "module": "sql-window-functions",
        "topic": "rank-lead-lag"
      }
    ]
  },
  {
    "id": "systems-engineer",
    "title": "Systems / Low-Latency C++ Engineer",
    "category": "Systems",
    "shortDescription": "Engineers ultra-low-latency, mission-critical systems in financial trading, gaming engines, and OS kernels.",
    "overview": "Systems Engineers work close to the metal, crafting software where nanoseconds matter. They master memory allocation, cache locality, CPU branch prediction, zero-cost abstractions, and concurrency in C++.",
    "basicRequirements": [
      "C and C++ fundamentals (pointers, references, arrays, memory layout)",
      "Object-oriented C++: classes, inheritance, virtual functions, RAII idiom",
      "C++ Standard Library (STL): vector, map, algorithms, iterators",
      "Debugging with GDB and memory analysis with Valgrind",
      "Build systems: CMake and Makefiles"
    ],
    "intermediateRequirements": [
      "Modern C++ standards (C++11, C++14, C++17, C++20)",
      "Move semantics, rvalue references, perfect forwarding (std::forward)",
      "Smart pointers: std::unique_ptr, std::shared_ptr, std::weak_ptr",
      "Multithreading: std::thread, std::mutex, condition_variable, std::atomic",
      "Templates and basic generic programming"
    ],
    "advancedRequirements": [
      "Lock-free data structures and C++ memory models (memory_order_relaxed/acquire/release)",
      "Cache-friendly data structures (Data-Oriented Design) and cache-line alignment",
      "Custom memory allocators: Arena, Pool, Stack allocators, placement new",
      "Low-latency networking: Kernel bypass (Solarflare OpenOnload, DPDK), epoll, ring buffers",
      "Template metaprogramming, compile-time evaluation (constexpr, consteval), C++20 Concepts"
    ],
    "industryReadyRequirements": [
      "Profiling with Linux perf, VTune, and hardware performance counters",
      "High-Frequency Trading (HFT) order-matching engines and market-data decoders",
      "Eliminating page faults, dynamic heap allocations in hot paths, and branch mispredictions"
    ],
    "recommendedLanguages": [
      "C++",
      "C",
      "Rust"
    ],
    "recommendedTechnologies": [
      "C++20",
      "CMake",
      "GDB",
      "Valgrind",
      "Linux",
      "DPDK"
    ],
    "commonCombinations": [
      {
        "combo": "C++20 + Linux + CMake + GDB + Hardware Perfcounters",
        "description": "Gold standard for quantitative finance, autonomous vehicles, and high-performance game engines."
      }
    ],
    "requiredSkills": [
      {
        "skill": "C++",
        "level": "Advanced",
        "category": "Language",
        "isCore": true
      },
      {
        "skill": "Data Structures",
        "level": "Advanced",
        "category": "Concept",
        "isCore": true
      },
      {
        "skill": "Concurrency",
        "level": "Advanced",
        "category": "Concept",
        "isCore": true
      },
      {
        "skill": "Linux",
        "level": "Intermediate",
        "category": "OS",
        "isCore": true
      }
    ],
    "learningPathModules": [
      {
        "language": "C++",
        "module": "cpp-oop",
        "topic": "vtable-virtual-functions"
      },
      {
        "language": "C++",
        "module": "cpp-raii",
        "topic": "smart-pointers-raii"
      },
      {
        "language": "C++",
        "module": "cpp-move-semantics",
        "topic": "move-semantics-forward"
      }
    ]
  },
  {
    "id": "mobile-app-developer",
    "title": "Mobile App Developer (Flutter / React Native)",
    "category": "Development",
    "shortDescription": "Creates fluid, high-performance cross-platform mobile apps for iOS and Android devices.",
    "overview": "Mobile App Developers craft native and cross-platform mobile experiences with responsive gesture navigation, offline-first data caching, push notifications, and hardware sensor integrations.",
    "basicRequirements": [
      "Dart / JavaScript / TypeScript fundamentals",
      "UI component trees, widgets, layouts, and responsive screen adaptability",
      "State management basics and event handling",
      "Consuming REST APIs and local caching with SQLite or SharedPreferences",
      "Git version control"
    ],
    "intermediateRequirements": [
      "Advanced State Management (Bloc / Provider / Riverpod / Redux)",
      "Native device integration (Camera, GPS, Bluetooth, biometric auth)",
      "Offline-first synchronization patterns and optimistic UI updates",
      "Deep linking, push notifications (FCM / APNs), and background services",
      "Unit and widget / component testing"
    ],
    "advancedRequirements": [
      "Custom animation pipelines and 60/120 FPS jank elimination",
      "App Store & Google Play distribution guidelines, code signing, and release tracks",
      "Native bridge writing (Kotlin/Swift native modules for cross-platform frameworks)",
      "In-App Purchases (IAP) and subscription lifecycle management"
    ],
    "industryReadyRequirements": [
      "Automated mobile CI/CD pipelines using Fastlane and Bitrise",
      "App performance telemetry, crash reporting with Firebase Crashlytics",
      "App size minimization, tree-shaking assets, and dynamic code splitting"
    ],
    "recommendedLanguages": [
      "Dart",
      "TypeScript",
      "Kotlin",
      "Swift"
    ],
    "recommendedTechnologies": [
      "Flutter",
      "React Native",
      "Firebase",
      "Fastlane",
      "SQLite"
    ],
    "commonCombinations": [
      {
        "combo": "Flutter + Dart + Firebase + SQLite",
        "description": "Cross-platform mobile standard with 120 FPS compiled Skia/Impeller rendering."
      }
    ],
    "requiredSkills": [
      {
        "skill": "Mobile Development",
        "level": "Intermediate",
        "category": "Concept",
        "isCore": true
      },
      {
        "skill": "TypeScript",
        "level": "Intermediate",
        "category": "Language",
        "isCore": true
      },
      {
        "skill": "REST APIs",
        "level": "Intermediate",
        "category": "Concept",
        "isCore": true
      }
    ],
    "learningPathModules": [
      {
        "language": "JavaScript",
        "module": "js-async",
        "topic": "promise-combinators"
      }
    ]
  },
  {
    "id": "cybersecurity-engineer",
    "title": "Cybersecurity & Application Security Engineer",
    "category": "Security",
    "shortDescription": "Protects digital systems from threats, conducts vulnerability assessments, and enforces zero-trust architectures.",
    "overview": "Cybersecurity engineers audit source code, conduct penetration tests, defend against adversarial attack vectors, implement cryptography standards, and ensure enterprise compliance with security regulations.",
    "basicRequirements": [
      "Networking protocols (TCP/IP, DNS, HTTP/S, ARP, ICMP, firewalls)",
      "Linux security administration, bash scripting, and log analysis",
      "OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, IDOR, SSRF, Broken Auth)",
      "Cryptography basics (Symmetric vs Asymmetric encryption, Hashing, Salting, TLS)"
    ],
    "intermediateRequirements": [
      "Vulnerability scanning with Burp Suite, OWASP ZAP, Nessus, and Nmap",
      "Static Application Security Testing (SAST) and DAST pipeline integration (SonarQube, Snyk)",
      "Identity and Access Management (IAM), OAuth 2.0, OpenID Connect, SAML, and MFA",
      "Web Application Firewalls (WAF) rule configuration (ModSecurity, Cloudflare)",
      "Secure code review in Java, Python, and JavaScript/TypeScript"
    ],
    "advancedRequirements": [
      "Cloud security posture management (CSPM) and Kubernetes security (Falco, Kyverno)",
      "Threat modeling methodologies (STRIDE, PASTA)",
      "Public Key Infrastructure (PKI) management, certificate authority lifecycles",
      "Exploit payload crafting and security remediation verification"
    ],
    "industryReadyRequirements": [
      "Incident response protocols, digital forensics, and SIEM monitoring (Splunk, Elastic SIEM)",
      "Zero-Trust Architecture implementation across enterprise endpoints and cloud workloads",
      "Compliance audit execution for SOC 2 Type II, ISO 27001, and PCI-DSS standards"
    ],
    "recommendedLanguages": [
      "Python",
      "Bash",
      "Go"
    ],
    "recommendedTechnologies": [
      "Burp Suite",
      "Wireshark",
      "Nmap",
      "Metasploit",
      "Docker",
      "Linux"
    ],
    "commonCombinations": [
      {
        "combo": "Python + Linux + Burp Suite + Wireshark + Nmap",
        "description": "Standard toolkit for penetration testing and offensive/defensive security engineering."
      }
    ],
    "requiredSkills": [
      {
        "skill": "Network Security",
        "level": "Advanced",
        "category": "Security",
        "isCore": true
      },
      {
        "skill": "Linux",
        "level": "Advanced",
        "category": "OS",
        "isCore": true
      },
      {
        "skill": "Python",
        "level": "Intermediate",
        "category": "Language",
        "isCore": true
      },
      {
        "skill": "Cryptography",
        "level": "Intermediate",
        "category": "Concept",
        "isCore": true
      }
    ],
    "learningPathModules": [
      {
        "language": "JavaScript",
        "module": "web-security",
        "topic": "cors-preflight-csrf"
      },
      {
        "language": "Java",
        "module": "java-security",
        "topic": "jca-encryption"
      }
    ]
  },
  {
    "id": "site-reliability-engineer",
    "title": "Site Reliability Engineer (SRE)",
    "category": "Infrastructure",
    "shortDescription": "Applies software engineering disciplines to infrastructure challenges to guarantee ultra-high uptime and reliability.",
    "overview": "SREs bridge software development and operations by establishing service-level objectives (SLOs/SLAs), automating disaster recovery, managing incident response, and building resilient distributed systems.",
    "basicRequirements": [
      "Linux system internals (CPU scheduling, I/O bottlenecks, memory paging, systemd)",
      "Scripting and automation in Python or Go, and shell scripting in Bash",
      "Computer networking (DNS, routing, load balancing, TCP socket behavior)",
      "Git version control and automated deployments"
    ],
    "intermediateRequirements": [
      "SLI / SLO / SLA formulation and Error Budget management",
      "Monitoring and metrics collection with Prometheus, Grafana, and Alertmanager",
      "Centralized distributed log aggregation (Elasticsearch, Fluentd, Kibana / Loki)",
      "Incident management, root cause analysis (RCA), and blameless postmortems",
      "Docker and Kubernetes cluster operations"
    ],
    "advancedRequirements": [
      "Distributed tracing with OpenTelemetry and Jaeger to isolate microsecond bottlenecks",
      "Automated capacity planning and horizontal/vertical autoscaling algorithms",
      "Chaos Engineering experiments to test partial degradation resilience (Chaos Monkey)",
      "High-availability database failover mechanisms (Postgres Patroni, Raft consensus)"
    ],
    "industryReadyRequirements": [
      "On-call escalation management with PagerDuty / Opsgenie",
      "Zero-downtime multi-region disaster recovery automated execution",
      "Building self-healing infrastructure that mitigates common failures autonomously"
    ],
    "recommendedLanguages": [
      "Go",
      "Python",
      "Bash"
    ],
    "recommendedTechnologies": [
      "Prometheus",
      "Grafana",
      "Kubernetes",
      "OpenTelemetry",
      "Terraform",
      "Docker"
    ],
    "commonCombinations": [
      {
        "combo": "Kubernetes + Prometheus + Grafana + OpenTelemetry + Go",
        "description": "Standard modern SRE observability and reliability automation stack."
      }
    ],
    "requiredSkills": [
      {
        "skill": "Linux",
        "level": "Advanced",
        "category": "OS",
        "isCore": true
      },
      {
        "skill": "Kubernetes",
        "level": "Advanced",
        "category": "Platform",
        "isCore": true
      },
      {
        "skill": "Prometheus",
        "level": "Advanced",
        "category": "Tool",
        "isCore": true
      },
      {
        "skill": "Python",
        "level": "Intermediate",
        "category": "Language",
        "isCore": true
      }
    ],
    "learningPathModules": [
      {
        "language": "Bash",
        "module": "bash-pipelines",
        "topic": "streams-exit-codes"
      }
    ]
  },
  {
    "id": "qa-automation-engineer",
    "title": "QA Automation & SDET Engineer",
    "category": "Development",
    "shortDescription": "Engineers automated test frameworks, regression suites, and load testing harnesses to guarantee software quality.",
    "overview": "Software Development Engineers in Test (SDET) build comprehensive automation frameworks across unit, integration, API, UI, and performance layers to ensure software releases meet rigorous reliability standards.",
    "basicRequirements": [
      "Core programming skills in JavaScript, Python, or Java",
      "Understanding of Software Testing Life Cycle (STLC) and Test Pyramid",
      "Manual test case design, edge-case identification, bug reporting",
      "Basic SQL for database state verification in test assertions"
    ],
    "intermediateRequirements": [
      "Modern Web UI Automation with Playwright, Cypress, or Selenium WebDriver",
      "API testing automation using Postman / Newman, REST Assured, or pytest-requests",
      "BDD (Behavior Driven Development) with Cucumber / Gherkin syntax",
      "Test runner suites (JUnit 5, PyTest, Mocha, Jest) with assertions and reporters",
      "Integration of automated test runs into CI/CD pipelines (GitHub Actions)"
    ],
    "advancedRequirements": [
      "Page Object Model (POM) and modular framework architecture",
      "Performance and load testing with k6, JMeter, or Locust (VU concurrency profiles)",
      "Mobile test automation with Appium on iOS and Android emulators",
      "Mocking external dependencies using Mock Service Worker (MSW) or WireMock"
    ],
    "industryReadyRequirements": [
      "Parallel test execution across distributed browser grids (Selenium Grid, Playwright Sharding)",
      "Visual regression testing (Percy, Applitools) to catch layout regressions",
      "Flaky test detection and automated retry / quarantine policies"
    ],
    "recommendedLanguages": [
      "TypeScript",
      "Python",
      "Java"
    ],
    "recommendedTechnologies": [
      "Playwright",
      "PyTest",
      "Cypress",
      "k6",
      "Postman",
      "Docker",
      "GitHub Actions"
    ],
    "commonCombinations": [
      {
        "combo": "TypeScript + Playwright + k6 + GitHub Actions",
        "description": "Fastest and most reliable modern SDET end-to-end automation suite."
      }
    ],
    "requiredSkills": [
      {
        "skill": "JavaScript",
        "level": "Intermediate",
        "category": "Language",
        "isCore": true
      },
      {
        "skill": "Python",
        "level": "Intermediate",
        "category": "Language",
        "isCore": true
      },
      {
        "skill": "REST APIs",
        "level": "Intermediate",
        "category": "Concept",
        "isCore": true
      },
      {
        "skill": "Git",
        "level": "Basic",
        "category": "Tool",
        "isCore": true
      }
    ],
    "learningPathModules": [
      {
        "language": "JavaScript",
        "module": "testing-js",
        "topic": "testing-library-principles"
      }
    ]
  },
  {
    "id": "cloud-solutions-architect",
    "title": "Cloud Solutions Architect",
    "category": "Architecture",
    "shortDescription": "Designs resilient, cost-effective, multi-tier enterprise cloud architectures on AWS, GCP, or Azure.",
    "overview": "Cloud Architects bridge business goals and engineering execution by evaluating technical tradeoffs, selecting cloud managed services, and establishing governance, security, and scalability standards.",
    "basicRequirements": [
      "Broad knowledge of Cloud Service Models (IaaS, PaaS, SaaS, FaaS)",
      "Core cloud services: Compute (EC2), Object Storage (S3), Managed Databases (RDS)",
      "Cloud networking: VPCs, Subnets, Route Tables, NAT Gateways, Internet Gateways",
      "Basic understanding of security principles (IAM policies, encryption at rest/transit)"
    ],
    "intermediateRequirements": [
      "Serverless architectures (AWS Lambda, API Gateway, DynamoDB, EventBridge)",
      "Multi-AZ high-availability architectures, auto-scaling groups, and load balancers (ALB)",
      "Cloud database selection: Relational (Aurora) vs NoSQL (DynamoDB) vs Cache (ElastiCache)",
      "Infrastructure as Code with Terraform or AWS CDK",
      "Cloud migration strategies (6 Rs: Rehost, Replatform, Repurchase, Refactor, Retire, Retain)"
    ],
    "advancedRequirements": [
      "Multi-region active-active architectures and global latency routing (Route 53)",
      "Well-Architected Framework: Operational Excellence, Security, Reliability, Performance, Cost, Sustainability",
      "Enterprise hybrid-cloud networking (Direct Connect, Transit Gateway, VPNs)",
      "Event-Driven Architecture (EDA) decoupling microservices asynchronously"
    ],
    "industryReadyRequirements": [
      "Enterprise disaster recovery (RPO/RTO minimization: Pilot Light, Warm Standby, Multi-Region Active)",
      "Cloud governance, multi-account hierarchy with AWS Organizations and Control Tower",
      "Executive technical review defense and business case ROI formulation"
    ],
    "recommendedLanguages": [
      "Python",
      "TypeScript",
      "Bash"
    ],
    "recommendedTechnologies": [
      "AWS",
      "Terraform",
      "Docker",
      "Kubernetes",
      "PostgreSQL",
      "Kafka"
    ],
    "commonCombinations": [
      {
        "combo": "AWS Well-Architected + Terraform + Kubernetes + Aurora",
        "description": "Premier enterprise cloud solution pattern for high-scale digital transformations."
      }
    ],
    "requiredSkills": [
      {
        "skill": "System Design",
        "level": "Advanced",
        "category": "Concept",
        "isCore": true
      },
      {
        "skill": "Docker",
        "level": "Intermediate",
        "category": "Platform",
        "isCore": true
      },
      {
        "skill": "SQL",
        "level": "Intermediate",
        "category": "Database",
        "isCore": true
      },
      {
        "skill": "Linux",
        "level": "Intermediate",
        "category": "OS",
        "isCore": true
      }
    ],
    "learningPathModules": [
      {
        "language": "SQL",
        "module": "sql-optimization",
        "topic": "explain-analyze-plans"
      }
    ]
  },
  {
    "id": "embedded-systems-engineer",
    "title": "Embedded Systems & Firmware Engineer",
    "category": "Systems",
    "shortDescription": "Writes low-level firmware for microcontrollers, sensors, IoT hardware, and real-time operating systems.",
    "overview": "Embedded Systems Engineers program bare-metal microcontrollers and RTOS environments. They work directly with hardware registers, communication buses (I2C, SPI, UART), interrupt handlers, and power optimization.",
    "basicRequirements": [
      "C and embedded C programming (bitwise operations, pointers, volatile keyword)",
      "Basic electronics: reading schematics, understanding voltage, current, pull-up resistors",
      "Hardware interfaces: GPIO, timers, PWM, analog-to-digital converters (ADC)",
      "Standard protocols: UART, SPI, I2C communication"
    ],
    "intermediateRequirements": [
      "Microcontroller architectures: ARM Cortex-M, ESP32, AVR, STM32",
      "Real-Time Operating Systems (FreeRTOS: Tasks, Queues, Semaphores, Mutexes)",
      "Interrupt Service Routines (ISR) guidelines and latency minimization",
      "Oscilloscope, Logic Analyzer, and JTAG / SWD debugging with hardware probes",
      "Flash memory management, EEPROM, and bootloader architecture"
    ],
    "advancedRequirements": [
      "Low-power optimization: sleep modes, wake-on-interrupt, power profiling",
      "Wireless IoT connectivity: BLE (Bluetooth Low Energy), Wi-Fi, LoRaWAN, MQTT",
      "Firmware Over-The-Air (FOTA) updates with cryptographic signature verification",
      "Embedded Linux systems (Yocto, Buildroot, device drivers)"
    ],
    "industryReadyRequirements": [
      "Hardware-software co-design, board bring-up, and EMI/EMC compliance",
      "Safety-critical embedded standards (MISRA C, ISO 26262 automotive safety)",
      "Deterministic timing analysis and zero-crash memory safety in long-running nodes"
    ],
    "recommendedLanguages": [
      "C",
      "C++",
      "Python"
    ],
    "recommendedTechnologies": [
      "FreeRTOS",
      "STM32",
      "ESP-IDF",
      "GDB",
      "Git",
      "CMake"
    ],
    "commonCombinations": [
      {
        "combo": "C + FreeRTOS + ARM Cortex-M + I2C/SPI + JTAG",
        "description": "Standard embedded firmware architecture across automotive, medical, and consumer electronics."
      }
    ],
    "requiredSkills": [
      {
        "skill": "C++",
        "level": "Intermediate",
        "category": "Language",
        "isCore": true
      },
      {
        "skill": "Linux",
        "level": "Intermediate",
        "category": "OS",
        "isCore": true
      },
      {
        "skill": "Data Structures",
        "level": "Intermediate",
        "category": "Concept",
        "isCore": true
      }
    ],
    "learningPathModules": [
      {
        "language": "C++",
        "module": "cpp-fundamentals",
        "topic": "pointers-references"
      }
    ]
  }
,
{
  "id": "mechanical-design-engineer",
  "title": "Mechanical Design Engineer",
  "category": "Mechanical",
  "shortDescription": "Designs mechanical assemblies, enclosures, mechanisms, and tooling using parametric 3D CAD and GD&T.",
  "overview": "Mechanical Design Engineers lead the conceptualization, 3D modeling, tolerance analysis, and manufacturing drafting of mechanical systems across automotive, aerospace, and industrial machinery sectors.",
  "basicRequirements": [
    "Engineering Graphics & Orthographic Projections",
    "Parametric 3D Solid Modeling (SolidWorks / Creo / CATIA)",
    "2D Detailing & Drafting in AutoCAD Mechanical",
    "Material Selection Basics (Metals, Polymers, Composites)",
    "Basic Mechanics of Materials & Stress Analysis"
  ],
  "intermediateRequirements": [
    "GD&T (ASME Y14.5) - Datums, MMC, and Position Tolerances",
    "Complex Assembly Mates, Kinematics, and Interference Analysis",
    "Sheet Metal Design, K-factors, and Flat Pattern Generation",
    "Plastic Injection Mold Design & Draft Angles",
    "Finite Element Analysis (FEA) for Static Structural Stress"
  ],
  "advancedRequirements": [
    "DFM / DFA (Design for Manufacturing & Assembly) optimization",
    "Non-linear FEA, Fatigue Life Estimation, and Thermal Stress Analysis",
    "Mechanism Synthesis & Dynamic Motion Simulation",
    "Tolerance Stack-Up Analysis (Worst-Case & RSS Statistical)",
    "PLM / PDM Systems (Teamcenter / Windchill / SolidWorks PDM)"
  ],
  "industryReadyRequirements": [
    "Full Product Lifecycle from concept to tool validation and prototyping",
    "Vendor liaison for CNC machining, stamping, and injection molding",
    "Cost reduction and weight optimization (Generative Design)",
    "DFMEA (Design Failure Mode and Effect Analysis) leadership"
  ],
  "recommendedLanguages": [
    "SolidWorks",
    "AutoCAD (Mechanical)",
    "GD&T",
    "CNC Machining & G-Code Programming"
  ],
  "recommendedTechnologies": [
    "SolidWorks",
    "AutoCAD",
    "ANSYS Mechanical",
    "PTC Creo",
    "Mastercam"
  ],
  "commonCombinations": [
    {
      "combo": "SolidWorks + GD&T + FEA (ANSYS) + DFM",
      "description": "Standard automotive and industrial machinery design engineering skill stack."
    }
  ],
  "requiredSkills": [
    {
      "skill": "SolidWorks",
      "level": "Advanced",
      "category": "CAD",
      "isCore": true
    },
    {
      "skill": "GD&T",
      "level": "Intermediate",
      "category": "Standards",
      "isCore": true
    },
    {
      "skill": "AutoCAD (Mechanical)",
      "level": "Intermediate",
      "category": "Drafting",
      "isCore": true
    }
  ],
  "learningPathModules": [
    {
      "language": "SolidWorks",
      "module": "Part Modeling",
      "topic": "2D Sketching, Relations & Constraints"
    }
  ]
},
{
  "id": "automation-plc-engineer",
  "title": "Industrial Automation & PLC Engineer",
  "category": "Electrical",
  "shortDescription": "Programs industrial PLCs, configures SCADA/HMI systems, and integrates sensors, drives, and fieldbuses.",
  "overview": "Automation Engineers design, program, commission, and troubleshoot real-time industrial automation control systems for automated factories, power plants, water treatment, and manufacturing lines.",
  "basicRequirements": [
    "Electrical Circuit Analysis & Relay Logic",
    "PLC Architecture & Hardware Wiring (Sinking/Sourcing, 24VDC)",
    "Ladder Logic (LD) Programming Basics (Contacts, Coils, Interlocks)",
    "Industrial Sensors (Proximity, Photoelectric, Thermocouples, 4-20mA)",
    "Motor Starter Circuits (DOL, Star-Delta, Soft Starters)"
  ],
  "intermediateRequirements": [
    "Siemens TIA Portal (S7-1200/1500) & Allen-Bradley Logix 5000",
    "SCADA Design (WinCC, Ignition, Wonderware) & Dynamic HMI Screens",
    "Industrial Fieldbus Protocols (Modbus RTU/TCP, Profinet, Profibus)",
    "Variable Frequency Drive (VFD) parameterization & closed-loop PID control",
    "Analog Signal Conditioning & 4-20mA Scaling Blocks"
  ],
  "advancedRequirements": [
    "Structured Text (ST) and Sequential Function Charts (SFC - IEC 61131-3)",
    "OPC-UA Server/Client integration with MES and Enterprise databases",
    "Safety PLCs & Safety Integrity Level (SIL / Category 4 safety circuits)",
    "Distributed I/O systems and industrial Ethernet cybersecurity"
  ],
  "industryReadyRequirements": [
    "End-to-end plant commissioning, loop checking, and FAT/SAT acceptance",
    "Zero-downtime line troubleshooting under real operating conditions",
    "Telemetry, historian logging, and predictive maintenance integration"
  ],
  "recommendedLanguages": [
    "PLC Programming",
    "SCADA & HMI Systems",
    "MATLAB & Simulink"
  ],
  "recommendedTechnologies": [
    "Siemens TIA Portal",
    "Rockwell FactoryTalk",
    "Ignition SCADA",
    "Modbus TCP",
    "ABB Drives"
  ],
  "commonCombinations": [
    {
      "combo": "PLC (Siemens S7) + SCADA (Ignition) + Profinet + VFD",
      "description": "Standard modern industrial automation and smart manufacturing factory stack."
    }
  ],
  "requiredSkills": [
    {
      "skill": "PLC Programming",
      "level": "Advanced",
      "category": "Controls",
      "isCore": true
    },
    {
      "skill": "SCADA & HMI Systems",
      "level": "Intermediate",
      "category": "Supervisory",
      "isCore": true
    },
    {
      "skill": "MATLAB & Simulink",
      "level": "Intermediate",
      "category": "Simulation",
      "isCore": false
    }
  ],
  "learningPathModules": [
    {
      "language": "PLC Programming",
      "module": "Ladder Logic",
      "topic": "Ladder Logic Programming & Bit Instructions"
    }
  ]
},
{
  "id": "structural-design-engineer",
  "title": "Structural Design Engineer",
  "category": "Civil",
  "shortDescription": "Analyzes and designs reinforced concrete (RCC) and steel structures, high-rises, and foundations.",
  "overview": "Structural Design Engineers model, analyze, and engineer safe, code-compliant load-bearing systems for commercial, residential, and infrastructure projects under gravity, wind, and seismic loadings.",
  "basicRequirements": [
    "Engineering Mechanics, Shear Force & Bending Moment Diagrams",
    "Properties of Structural Steel and Reinforced Concrete (IS 456 / ACI 318)",
    "AutoCAD Civil Drafting for Structural Detailing",
    "Elementary Beam, Column, and Slab Analysis",
    "Soil Mechanics & Bearing Capacity Basics"
  ],
  "intermediateRequirements": [
    "STAAD.Pro & ETABS 3D Space Frame Finite Element Modeling",
    "Seismic Analysis & Response Spectrum Method (IS 1893:2016)",
    "Wind Load Calculations according to Terrain & Height (IS 875 Part 3)",
    "Reinforced Concrete Design: Beams, Columns, Footings, and Retaining Walls",
    "Steel Truss, Gantry Girder, and Bolted/Welded Connection Design (IS 800)"
  ],
  "advancedRequirements": [
    "Non-linear Static Pushover Analysis and P-Delta Analysis",
    "High-rise Shear Wall Design and Diaphragm Flexibility Modeling",
    "Deep Foundation Design (Pile caps, Raft foundations, Soil-structure interaction)",
    "Performance-Based Seismic Design and Base Isolation Basics"
  ],
  "industryReadyRequirements": [
    "Complete structural vetting and peer-review certification for high-rises",
    "Site structural audit, deflection and crack-width compliance verification",
    "Optimized bar bending schedules (BBS) and structural quantity estimation"
  ],
  "recommendedLanguages": [
    "STAAD.Pro",
    "AutoCAD (Civil)",
    "Autodesk Revit & BIM"
  ],
  "recommendedTechnologies": [
    "STAAD.Pro",
    "ETABS",
    "SAFE",
    "AutoCAD Civil",
    "Revit Structure"
  ],
  "commonCombinations": [
    {
      "combo": "ETABS + STAAD.Pro + IS 456 + IS 1893 + SAFE",
      "description": "Premier structural engineering consultancy and high-rise design skillset."
    }
  ],
  "requiredSkills": [
    {
      "skill": "STAAD.Pro",
      "level": "Advanced",
      "category": "Analysis",
      "isCore": true
    },
    {
      "skill": "AutoCAD (Civil)",
      "level": "Intermediate",
      "category": "Drafting",
      "isCore": true
    },
    {
      "skill": "Autodesk Revit & BIM",
      "level": "Intermediate",
      "category": "BIM",
      "isCore": false
    }
  ],
  "learningPathModules": [
    {
      "language": "STAAD.Pro",
      "module": "RCC Beam Analysis",
      "topic": "Dead, Live, Wind & Seismic Load Combinations (IS 1893 & IS 875)"
    }
  ]
},
{
  "id": "bim-coordinator",
  "title": "BIM Coordinator & Modeler",
  "category": "Civil",
  "shortDescription": "Manages 3D Building Information Modeling (BIM), multidisciplinary clash detection, and quantity takeoffs.",
  "overview": "BIM Coordinators orchestrate 3D digital construction models across architectural, structural, and MEP disciplines, running automated clash resolution and standardizing LOD 300-500 execution plans.",
  "basicRequirements": [
    "Architectural Drafting & 3D Spatial Understanding",
    "Autodesk Revit Fundamentals (Walls, Slabs, Levels, Grids)",
    "AutoCAD 2D-to-3D Integration",
    "Construction Terminology & Building Components",
    "BIM Terminology (LOD, BEP, CDE, IFC)"
  ],
  "intermediateRequirements": [
    "Parametric Revit Family Creation (.rfa components)",
    "Multidisciplinary Clash Detection using Navisworks Manage",
    "Automated Quantity Takeoffs and Bill of Quantities (BOQ) in Revit",
    "BIM Execution Plan (BEP) implementation according to ISO 19650",
    "Coordination of Architectural, Structural, and MEP models"
  ],
  "advancedRequirements": [
    "4D Construction Scheduling simulation (Navisworks Timeliner / Synchro)",
    "5D Cost Modeling and real-time material variance tracking",
    "Dynamo Visual Scripting for Revit automation and generative geometry",
    "Common Data Environment (CDE) administration (BIM 360 / Autodesk Construction Cloud)"
  ],
  "industryReadyRequirements": [
    "Lead weekly inter-disciplinary clash coordination meetings with contractors",
    "Manage As-Built LOD 500 handovers for Facility Management",
    "Drive zero-rework construction site coordination protocols"
  ],
  "recommendedLanguages": [
    "Autodesk Revit & BIM",
    "AutoCAD (Civil)"
  ],
  "recommendedTechnologies": [
    "Autodesk Revit",
    "Navisworks Manage",
    "Dynamo",
    "AutoCAD",
    "Autodesk Construction Cloud"
  ],
  "commonCombinations": [
    {
      "combo": "Revit + Navisworks + ISO 19650 + Dynamo",
      "description": "Standard international BIM consultancy and digital twin execution stack."
    }
  ],
  "requiredSkills": [
    {
      "skill": "Autodesk Revit & BIM",
      "level": "Advanced",
      "category": "BIM",
      "isCore": true
    },
    {
      "skill": "AutoCAD (Civil)",
      "level": "Intermediate",
      "category": "Drafting",
      "isCore": true
    }
  ],
  "learningPathModules": [
    {
      "language": "Autodesk Revit & BIM",
      "module": "BIM Coordination",
      "topic": "Parametric BIM Modeling, Levels & Grids"
    }
  ]
}
];
