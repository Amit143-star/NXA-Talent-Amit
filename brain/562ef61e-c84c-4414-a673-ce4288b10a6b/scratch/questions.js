const NXA_ELITE_QUESTIONS = [
    {
        q: "In a distributed system, what does the CAP theorem state regarding a network partition?",
        o: ["Availability and Consistency cannot both be guaranteed", "Consistency and Partition Tolerance are impossible", "Availability is prioritized over Latency", "Network speed determines Consistency"],
        a: 0
    },
    {
        q: "Which Transformer architecture component allows it to handle long-range dependencies regardless of distance?",
        o: ["Recurrent hidden states", "Self-Attention Mechanism", "Backpropagation through time", "Convolutional kernels"],
        a: 1
    },
    {
        q: "In Kubernetes, what is the primary purpose of an 'Admission Controller'?",
        o: ["To balance load across pods", "To intercept requests to the API server before object persistence", "To manage node-level hardware resources", "To encrypt traffic between services"],
        a: 1
    },
    {
        q: "Which consensus algorithm is specifically designed for high-performance permissioned blockchains like Hyperledger Fabric?",
        o: ["Proof of Work", "Raft", "PBFT (Practical Byzantine Fault Tolerance)", "Proof of Stake"],
        a: 2
    },
    {
        q: "In Zero Trust architecture, what is the 'Policy Decision Point' (PDP) responsible for?",
        o: ["Enforcing the connection", "Evaluating the access request against rules", "Storing user credentials", "Logging network traffic"],
        a: 1
    },
    {
        q: "Which data structure is most efficient for implementing a 'Least Recently Used' (LRU) cache with O(1) operations?",
        o: ["B-Tree + Queue", "Hash Map + Doubly Linked List", "Binary Search Tree", "Skip List"],
        a: 1
    },
    {
        q: "What is the time complexity of a 'Union-Find' operation with both Path Compression and Rank Optimization?",
        o: ["O(log N)", "O(N)", "O(α(N)) - Inverse Ackermann", "O(1)"],
        a: 2
    },
    {
        q: "In modern CPU architecture, what is 'Spectre' primarily exploiting?",
        o: ["Buffer overflows", "Speculative execution and side-channel analysis", "Direct Memory Access (DMA)", "Kernel-level race conditions"],
        a: 1
    },
    {
        q: "Which HTTP header is essential for preventing 'Clickjacking' attacks?",
        o: ["X-Content-Type-Options", "Content-Security-Policy (frame-ancestors)", "X-XSS-Protection", "Strict-Transport-Security"],
        a: 1
    },
    {
        q: "In a 'Microservices' architecture, which pattern is used to handle cross-cutting concerns like logging and auth at the entry point?",
        o: ["Circuit Breaker", "Saga Pattern", "API Gateway", "Strangler Fig"],
        a: 2
    },
    {
        q: "What is the primary difference between 'L1' and 'L2' Regularization in Machine Learning?",
        o: ["L1 produces sparse weights (zero-valued)", "L2 is only for classification", "L1 is faster to compute", "L2 prevents all overfitting"],
        a: 0
    },
    {
        q: "In Docker, which namespace provides isolation for the process tree?",
        o: ["Network Namespace", "PID Namespace", "Mount Namespace", "User Namespace"],
        a: 1
    },
    {
        q: "Which RAID level provides both mirroring and striping without using parity?",
        o: ["RAID 5", "RAID 10", "RAID 6", "RAID 1"],
        a: 1
    },
    {
        q: "What is 'Throttling' in the context of API design?",
        o: ["Deleting old data", "Controlling the rate of incoming requests", "Compressing response body", "Encrypting database fields"],
        a: 1
    },
    {
        q: "In Python, what does 'GIL' stand for and what is its primary effect?",
        o: ["Global Interlock Link - Speeds up I/O", "Global Interpreter Lock - Prevents multi-core CPU threading", "Garbage Internal Logic - Manages memory", "Generic Interface Layer - Connects to C++"],
        a: 1
    },
    {
        q: "Which design pattern is used to provide a unified interface to a set of interfaces in a subsystem?",
        o: ["Singleton", "Adapter", "Facade", "Decorator"],
        a: 2
    },
    {
        q: "In Database systems, what does 'Deadlock' refer to?",
        o: ["A database crash", "Two transactions waiting for each other to release locks", "A table with no primary key", "Data corruption in logs"],
        a: 1
    },
    {
        q: "Which sorting algorithm is guaranteed O(N log N) even in the worst case?",
        o: ["Quick Sort", "Heap Sort", "Bubble Sort", "Insertion Sort"],
        a: 1
    },
    {
        q: "What is the role of a 'Zookeeper' in a Hadoop/Kafka ecosystem?",
        o: ["Storing actual data", "Coordination and state management of distributed nodes", "Formatting hard drives", "Running SQL queries"],
        a: 1
    },
    {
        q: "In React, what is the 'Virtual DOM' primarily used for?",
        o: ["Replacing the real DOM", "Improving performance by minimizing direct DOM manipulation", "Storing user passwords", "Connecting to the server"],
        a: 1
    },
    {
        q: "Which AWS service is designed for serverless execution of code?",
        o: ["EC2", "S3", "Lambda", "RDS"],
        a: 2
    },
    {
        q: "What is 'Idempotency' in REST API design?",
        o: ["Multiple identical requests have the same effect as one", "The API is always available", "The API uses JSON only", "The API requires no authentication"],
        a: 0
    },
    {
        q: "In Networking, what is the purpose of 'BGP' (Border Gateway Protocol)?",
        o: ["Assigning IP addresses to home devices", "Routing data between different autonomous systems on the Internet", "Sending emails", "Managing local WiFi passwords"],
        a: 1
    },
    {
        q: "Which encryption type uses a Public Key and a Private Key?",
        o: ["Symmetric Encryption", "Asymmetric Encryption", "Hashing", "Obfuscation"],
        a: 1
    },
    {
        q: "In Git, what does 'Rebase' do compared to 'Merge'?",
        o: ["Deletes the history", "Moves or combines a sequence of commits to a new base commit", "Uploads code to GitHub", "Creates a new branch"],
        a: 1
    },
    {
        q: "What is 'Cross-Site Scripting' (XSS)?",
        o: ["A server-side database attack", "Injecting malicious scripts into web pages viewed by other users", "Stealing a physical laptop", "Sending spam emails"],
        a: 1
    },
    {
        q: "In Java, what is the purpose of the 'final' keyword on a class?",
        o: ["It makes the class abstract", "It prevents the class from being subclassed", "It makes all methods static", "It deletes the class on exit"],
        a: 1
    },
    {
        q: "Which SQL command is used to combine rows from two or more tables based on a related column?",
        o: ["SELECT", "UNION", "JOIN", "GROUP BY"],
        a: 2
    },
    {
        q: "What is 'Docker Swarm'?",
        o: ["A virus", "A native clustering tool for Docker containers", "A cloud storage service", "A code editor"],
        a: 1
    },
    {
        q: "In Artificial Intelligence, what is 'Overfitting'?",
        o: ["The model is too small", "The model performs well on training data but poorly on unseen data", "The model is too fast", "The model uses too much RAM"],
        a: 1
    }
];
