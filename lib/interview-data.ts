// This file contains all interview questions and sample answers
export const interviewQuestions = {
  technical: [
    {
      id: 1,
      question: "Can you explain the difference between var, let, and const in JavaScript?",
      sampleAnswer:
        "var has function scope and can be redeclared and updated. let has block scope and can be updated but not redeclared. const also has block scope but cannot be updated or redeclared after initialization.",
    },
    {
      id: 2,
      question: "What is the time complexity of searching in a balanced binary search tree?",
      sampleAnswer:
        "The time complexity of searching in a balanced binary search tree is O(log n), where n is the number of nodes in the tree.",
    },
    {
      id: 3,
      question: "Explain the concept of closures in JavaScript.",
      sampleAnswer:
        "A closure is a function that has access to its own scope, the outer function's variables, and global variables, even after the outer function has returned.",
    },
    {
      id: 4,
      question: "What's the difference between HTTP and HTTPS?",
      sampleAnswer:
        "HTTP (Hypertext Transfer Protocol) is the protocol used to transfer data over the web, while HTTPS (HTTP Secure) is the secure version which uses SSL/TLS encryption. HTTPS adds a layer of security by encrypting the data transmitted between the client and server, preventing man-in-the-middle attacks and data interception.",
    },
    {
      id: 5,
      question: "Explain the concept of RESTful APIs and its principles.",
      sampleAnswer:
        "REST (Representational State Transfer) is an architectural style for designing networked applications. RESTful APIs adhere to principles like: statelessness (no client state stored on server), client-server architecture, cacheable responses, uniform interface (resources are identified in requests), and a layered system. RESTful APIs typically use HTTP methods (GET, POST, PUT, DELETE) to perform CRUD operations on resources.",
    },
  ],
  behavioral: [
    {
      id: 1,
      question: "Tell me about a time when you had to work with a difficult team member. How did you handle it?",
      sampleAnswer:
        "In my previous role, I had a colleague who often missed deadlines. Instead of escalating immediately, I scheduled a private meeting to understand their challenges. We identified that they were overwhelmed with multiple projects, so I helped them prioritize tasks and offered assistance where possible. This improved our working relationship and team productivity.",
    },
    {
      id: 2,
      question: "Describe a situation where you had to make a difficult decision with limited information.",
      sampleAnswer:
        "During a product launch, we discovered a minor bug just hours before release. With limited time to assess the impact, I gathered the available data, consulted with key team members, and decided to proceed with the launch while preparing a patch for immediate release. This balanced business needs with product quality, and we transparently communicated with customers.",
    },
    {
      id: 3,
      question: "How do you handle criticism of your work?",
      sampleAnswer:
        "I view criticism as an opportunity to improve. When receiving feedback, I listen actively without becoming defensive, ask clarifying questions to fully understand the concerns, and then develop an action plan to address the issues. I follow up with the person who provided the feedback to ensure I've properly addressed their concerns.",
    },
    {
      id: 4,
      question: "Tell me about a time you had to adapt to a significant change at work.",
      sampleAnswer:
        "When our company transitioned to a remote-first model during the pandemic, I had to quickly adapt my team management style. I implemented daily check-ins, created detailed documentation, and established clear communication channels. I also encouraged team members to share their challenges and collectively find solutions. The transition was successful, and we maintained our productivity levels.",
    },
    {
      id: 5,
      question: "Describe a time when you went above and beyond for a project or customer.",
      sampleAnswer:
        "A client needed a critical feature implemented with a tight two-day deadline. I recognized the importance of this feature for their business, so I reprioritized my workload, worked extra hours, and collaborated closely with our QA team to ensure quality. I delivered the feature on time, and the client was extremely satisfied. This strengthened our relationship and led to an expanded contract.",
    },
  ],
  case: [
    {
      id: 1,
      question: "Your client is a grocery chain experiencing declining profits. How would you approach this problem?",
      sampleAnswer:
        "I would start by analyzing the financial data to identify specific areas of decline. Then I'd examine external factors like market competition and consumer trends, as well as internal factors like operational efficiency and pricing strategy. Based on this analysis, I might recommend solutions such as optimizing the product mix, improving supply chain efficiency, enhancing the customer experience, or exploring new revenue streams like online delivery.",
    },
    {
      id: 2,
      question: "Estimate the market size for electric vehicles in the United States for the next 5 years.",
      sampleAnswer:
        "To estimate the market size, I'd start with the current US passenger vehicle market of approximately 275 million vehicles. With annual sales of about 17 million vehicles and an EV adoption rate currently around 5%, that's about 850,000 EVs sold annually. Considering growth factors like government incentives, improving technology, expanding charging infrastructure, and consumer preferences, I'd project an annual growth rate of 25-30% for the next 5 years. This would result in approximately 3.2-3.5 million EVs sold annually by year 5, representing a market size of roughly $160-175 billion (assuming an average price of $50,000 per vehicle).",
    },
    {
      id: 3,
      question: "How would you determine if a company should enter the meal kit delivery market?",
      sampleAnswer:
        "I would evaluate this opportunity through several lenses: Market analysis (size, growth, competition), customer analysis (needs, willingness to pay, acquisition costs), operational feasibility (supply chain, logistics, food safety), financial analysis (startup costs, unit economics, path to profitability), and strategic fit (company capabilities, brand alignment). I'd also consider potential risks like market saturation, high customer acquisition costs, and logistical challenges. Based on these factors, I'd recommend whether to enter the market and, if so, what differentiation strategy to pursue.",
    },
    {
      id: 4,
      question:
        "A luxury fashion brand wants to expand into a new geographic market. How would you evaluate which market they should enter?",
      sampleAnswer:
        "I would evaluate potential markets using a framework that considers: Market size and growth (GDP per capita, luxury goods spending), competitive landscape (existing luxury brands, market saturation), consumer behavior (cultural affinity for luxury, shopping habits), operational feasibility (supply chain, retail locations, import regulations), and potential risks (economic stability, currency fluctuations, regulatory changes). I would then rank markets based on these criteria, with particular emphasis on the alignment between the brand's positioning and the target market's luxury consumption patterns.",
    },
    {
      id: 5,
      question: "How would you estimate the number of gas stations in the United States?",
      sampleAnswer:
        "To estimate the number of gas stations, I'd use a top-down approach. The US has approximately 330 million people with about 275 million registered vehicles. Assuming each vehicle needs to refuel roughly once per week, that's about 275 million refueling events weekly. If an average gas station can handle about 2,000 fill-ups per week (roughly 300 per day), we would need approximately 137,500 gas stations (275,000,000 ÷ 2,000). This aligns with the actual figure of about 150,000 gas stations in the US, accounting for variations in station size and geographic distribution.",
    },
  ],
  subjective: [
    {
      id: 1,
      question: "Explain the fundamental concepts of your subject area.",
      sampleAnswer:
        "The fundamental concepts in my field include the core theories, methodologies, and principles that form the foundation of the discipline. I would start by outlining the historical development of these concepts, then explain how they interconnect and form the theoretical framework that guides current research and practice.",
    },
    {
      id: 2,
      question: "How does your project relate to the broader field of study?",
      sampleAnswer:
        "My project addresses a specific gap in the current literature by applying established methodologies to a novel context. It builds upon previous work by researchers X and Y, but extends their findings by incorporating factor Z. The significance lies in how it bridges theoretical concepts with practical applications, potentially influencing future directions in the field.",
    },
    {
      id: 3,
      question: "What methodologies did you employ in your project, and why were they appropriate?",
      sampleAnswer:
        "I employed a mixed-methods approach combining quantitative data analysis with qualitative interviews. This methodology was appropriate because the research questions required both statistical validation and in-depth understanding of participant experiences. The quantitative component provided measurable outcomes, while the qualitative aspect revealed nuances in how participants interpreted these outcomes.",
    },
    {
      id: 4,
      question: "What were the limitations of your approach, and how might you address them in future work?",
      sampleAnswer:
        "The primary limitations included a relatively small sample size and potential regional bias in participant selection. These constraints may affect the generalizability of our findings. In future work, I would address these limitations by expanding the sample size, implementing stratified sampling techniques to ensure better representation, and potentially conducting a multi-site study to mitigate regional biases.",
    },
    {
      id: 5,
      question: "How do you envision this field evolving in the next 5-10 years?",
      sampleAnswer:
        "I anticipate several key developments in the field over the next decade. First, technological advancements will likely enable more sophisticated data collection and analysis methods. Second, interdisciplinary approaches will become increasingly important as complex problems require diverse perspectives. Finally, I expect a shift toward more participatory research models that involve stakeholders throughout the research process. My current work positions me to contribute to these developments by establishing methodologies that can adapt to these emerging trends.",
    },
  ],
}
