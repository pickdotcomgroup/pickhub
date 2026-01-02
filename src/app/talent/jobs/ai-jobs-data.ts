export interface AIJob {
  id: string;
  title: string;
  company: string;
  location: string;
  workType: "Hybrid" | "On-site" | "Remote";
  jobType: "Full-time" | "Contract" | "Part-time";
  salaryRange: string;
  description: string;
  postedAt: string;
  logo?: string;
  logoIcon?: string;
  experienceLevel: "Entry Level" | "Mid Level" | "Senior Level";
}

export const aiJobsData: AIJob[] = [
  {
    id: "1",
    title: "Senior AI Research Scientist",
    company: "Microsoft",
    location: "Redmond, WA",
    workType: "Hybrid",
    jobType: "Full-time",
    salaryRange: "$220k - $350k",
    description:
      "Join our Azure AI research team to push the boundaries of Large Language Models. You will be responsible for developing novel architectures for generative AI and advancing state-of-the-art research in natural language processing.",
    postedAt: "1 day ago",
    logoIcon: "microsoft",
    experienceLevel: "Senior Level",
  },
  {
    id: "2",
    title: "Machine Learning Engineer",
    company: "Netflix",
    location: "Los Gatos, CA",
    workType: "On-site",
    jobType: "Full-time",
    salaryRange: "$240k - $380k",
    description:
      "We are looking for an ML Engineer to improve our recommendation algorithms. You'll work with PyTorch and TensorFlow to build personalized content delivery models at scale serving millions of users worldwide.",
    postedAt: "4 hours ago",
    logoIcon: "netflix",
    experienceLevel: "Senior Level",
  },
  {
    id: "3",
    title: "Data Scientist (Fraud Detection AI)",
    company: "Stripe",
    location: "San Francisco, CA",
    workType: "Remote",
    jobType: "Contract",
    salaryRange: "$110/hr - $160/hr",
    description:
      "Help us build cutting-edge fraud detection systems using machine learning. You'll develop models to identify suspicious transactions in real-time and protect millions of businesses from financial fraud.",
    postedAt: "2 days ago",
    logoIcon: "stripe",
    experienceLevel: "Mid Level",
  },
  {
    id: "4",
    title: "NLP Engineer",
    company: "OpenAI",
    location: "San Francisco, CA",
    workType: "Hybrid",
    jobType: "Full-time",
    salaryRange: "$280k - $420k",
    description:
      "Work on next-generation language models and help shape the future of AI. You'll be part of a team pushing the boundaries of what's possible with natural language understanding and generation.",
    postedAt: "3 hours ago",
    logoIcon: "openai",
    experienceLevel: "Senior Level",
  },
  {
    id: "5",
    title: "Computer Vision Engineer",
    company: "Tesla",
    location: "Palo Alto, CA",
    workType: "On-site",
    jobType: "Full-time",
    salaryRange: "$200k - $300k",
    description:
      "Join our Autopilot team to develop computer vision algorithms for autonomous driving. You'll work on object detection, tracking, and scene understanding using deep learning techniques.",
    postedAt: "1 week ago",
    logoIcon: "tesla",
    experienceLevel: "Mid Level",
  },
  {
    id: "6",
    title: "AI Product Manager",
    company: "Google",
    location: "Mountain View, CA",
    workType: "Hybrid",
    jobType: "Full-time",
    salaryRange: "$190k - $280k",
    description:
      "Lead the product strategy for our AI-powered search features. You'll work closely with ML engineers and researchers to bring innovative AI products to billions of users.",
    postedAt: "5 days ago",
    logoIcon: "google",
    experienceLevel: "Senior Level",
  },
  {
    id: "7",
    title: "Junior ML Engineer",
    company: "Databricks",
    location: "San Francisco, CA",
    workType: "Remote",
    jobType: "Full-time",
    salaryRange: "$130k - $170k",
    description:
      "Great opportunity for early career ML engineers to work on large-scale data processing and machine learning infrastructure. You'll help build tools that enable data scientists worldwide.",
    postedAt: "2 days ago",
    logoIcon: "databricks",
    experienceLevel: "Entry Level",
  },
  {
    id: "8",
    title: "Deep Learning Researcher",
    company: "Meta",
    location: "Menlo Park, CA",
    workType: "Hybrid",
    jobType: "Full-time",
    salaryRange: "$250k - $380k",
    description:
      "Research and develop new deep learning architectures for computer vision and natural language processing. Publish papers at top conferences and bring research to production at scale.",
    postedAt: "6 hours ago",
    logoIcon: "meta",
    experienceLevel: "Senior Level",
  },
  {
    id: "9",
    title: "MLOps Engineer",
    company: "Spotify",
    location: "New York, NY",
    workType: "Remote",
    jobType: "Full-time",
    salaryRange: "$160k - $220k",
    description:
      "Build and maintain ML infrastructure and pipelines for our recommendation systems. You'll work on model deployment, monitoring, and optimization at scale.",
    postedAt: "3 days ago",
    logoIcon: "spotify",
    experienceLevel: "Mid Level",
  },
  {
    id: "10",
    title: "AI Ethics Researcher",
    company: "Anthropic",
    location: "San Francisco, CA",
    workType: "Hybrid",
    jobType: "Full-time",
    salaryRange: "$200k - $300k",
    description:
      "Help ensure AI systems are safe and beneficial. You'll research alignment techniques, evaluate model behavior, and contribute to the development of responsible AI practices.",
    postedAt: "1 day ago",
    logoIcon: "anthropic",
    experienceLevel: "Mid Level",
  },
  {
    id: "11",
    title: "Robotics ML Engineer",
    company: "Boston Dynamics",
    location: "Waltham, MA",
    workType: "On-site",
    jobType: "Full-time",
    salaryRange: "$180k - $260k",
    description:
      "Apply machine learning to robotic systems for locomotion, manipulation, and perception. Work on cutting-edge robots that push the boundaries of what machines can do.",
    postedAt: "4 days ago",
    logoIcon: "boston-dynamics",
    experienceLevel: "Mid Level",
  },
  {
    id: "12",
    title: "AI Solutions Consultant",
    company: "IBM",
    location: "Austin, TX",
    workType: "Remote",
    jobType: "Contract",
    salaryRange: "$95/hr - $140/hr",
    description:
      "Help enterprise clients implement AI solutions using Watson and other IBM AI products. You'll design architectures, lead implementations, and provide technical guidance.",
    postedAt: "1 week ago",
    logoIcon: "ibm",
    experienceLevel: "Senior Level",
  },
  {
    id: "13",
    title: "Speech Recognition Engineer",
    company: "Amazon",
    location: "Seattle, WA",
    workType: "Hybrid",
    jobType: "Full-time",
    salaryRange: "$175k - $270k",
    description:
      "Work on Alexa's speech recognition systems. You'll develop models for automatic speech recognition, speaker identification, and natural language understanding.",
    postedAt: "2 days ago",
    logoIcon: "amazon",
    experienceLevel: "Mid Level",
  },
  {
    id: "14",
    title: "AI Research Intern",
    company: "DeepMind",
    location: "London, UK",
    workType: "On-site",
    jobType: "Contract",
    salaryRange: "$8k - $12k/mo",
    description:
      "Summer internship opportunity to work alongside world-class AI researchers. You'll contribute to cutting-edge research in reinforcement learning, neuroscience-inspired AI, or game-playing agents.",
    postedAt: "5 days ago",
    logoIcon: "deepmind",
    experienceLevel: "Entry Level",
  },
  {
    id: "15",
    title: "Generative AI Engineer",
    company: "Adobe",
    location: "San Jose, CA",
    workType: "Hybrid",
    jobType: "Full-time",
    salaryRange: "$185k - $280k",
    description:
      "Build generative AI features for Creative Cloud products. Work on image generation, style transfer, and AI-assisted creative tools used by millions of designers and artists.",
    postedAt: "8 hours ago",
    logoIcon: "adobe",
    experienceLevel: "Mid Level",
  },
  {
    id: "16",
    title: "Autonomous Vehicle AI Engineer",
    company: "Waymo",
    location: "Mountain View, CA",
    workType: "On-site",
    jobType: "Full-time",
    salaryRange: "$220k - $340k",
    description:
      "Develop perception and prediction systems for self-driving vehicles. You'll work on sensor fusion, object detection, and behavior prediction to enable safe autonomous driving.",
    postedAt: "3 days ago",
    logoIcon: "waymo",
    experienceLevel: "Senior Level",
  },
  {
    id: "17",
    title: "Healthcare AI Specialist",
    company: "Tempus",
    location: "Chicago, IL",
    workType: "Remote",
    jobType: "Full-time",
    salaryRange: "$165k - $230k",
    description:
      "Apply machine learning to precision medicine. Develop models for cancer diagnosis, treatment optimization, and drug discovery using genomic and clinical data.",
    postedAt: "4 days ago",
    logoIcon: "tempus",
    experienceLevel: "Mid Level",
  },
  {
    id: "18",
    title: "Reinforcement Learning Engineer",
    company: "NVIDIA",
    location: "Santa Clara, CA",
    workType: "Hybrid",
    jobType: "Full-time",
    salaryRange: "$210k - $320k",
    description:
      "Work on reinforcement learning for robotics and game AI. You'll develop algorithms that enable agents to learn complex behaviors through interaction with their environment.",
    postedAt: "1 day ago",
    logoIcon: "nvidia",
    experienceLevel: "Senior Level",
  },
];

export const jobTypeFilters = [
  { value: "Full-time", label: "Full-time", count: 850 },
  { value: "Contract", label: "Contract", count: 120 },
  { value: "Remote", label: "Remote", count: 340 },
];

export const experienceLevelFilters = [
  { value: "Entry Level", label: "Entry Level" },
  { value: "Mid Level", label: "Mid Level" },
  { value: "Senior Level", label: "Senior Level" },
];

export const salaryRangeFilters = [
  { value: "100k-150k", label: "$100k - $150k" },
  { value: "150k-200k", label: "$150k - $200k" },
  { value: "200k+", label: "$200k +" },
];

export const sortOptions = [
  { value: "most-relevant", label: "Most Relevant" },
  { value: "newest", label: "Newest" },
  { value: "salary-high", label: "Salary: High to Low" },
  { value: "salary-low", label: "Salary: Low to High" },
];
