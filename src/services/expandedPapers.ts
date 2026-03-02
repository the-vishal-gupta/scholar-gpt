import type { ResearchPaper } from '@/types';

// Generate 1000 papers programmatically
export const mockPapersDB: ResearchPaper[] = [
  // Original 40 papers
  {
    id: '1',
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit'],
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...',
    year: 2017,
    citations: 149000,
    venue: 'NIPS',
    venueType: 'conference',
    url: 'https://arxiv.org/abs/1706.03762',
    keywords: ['transformer', 'attention', 'nlp', 'deep learning'],
    impact: 'high'
  },
  {
    id: '2',
    title: 'Deep Residual Learning for Image Recognition',
    authors: ['Kaiming He', 'Xiangyu Zhang', 'Shaoqing Ren', 'Jian Sun'],
    abstract: 'Deeper neural networks are more difficult to train...',
    year: 2016,
    citations: 198000,
    venue: 'CVPR',
    venueType: 'conference',
    url: 'https://arxiv.org/abs/1512.03385',
    keywords: ['resnet', 'cnn', 'computer vision', 'deep learning'],
    impact: 'high'
  },
  // Generate remaining 998 papers
  ...Array.from({ length: 998 }, (_, i) => {
    const id = (i + 3).toString();
    const year = 2010 + (i % 15);
    const citations = Math.floor(Math.random() * 50000) + 100;
    const venues = ['NIPS', 'ICML', 'ICLR', 'CVPR', 'ICCV', 'ECCV', 'AAAI', 'IJCAI', 'Nature', 'Science', 'JMLR', 'IEEE TPAMI'];
    const venue = venues[i % venues.length];
    const venueTypes = ['conference', 'journal', 'preprint'];
    const venueType = venueTypes[i % venueTypes.length] as 'conference' | 'journal' | 'preprint';
    
    const topics = [
      'Deep Learning', 'Machine Learning', 'Computer Vision', 'Natural Language Processing',
      'Reinforcement Learning', 'Neural Networks', 'Optimization', 'Generative Models',
      'Transfer Learning', 'Self-Supervised Learning', 'Multimodal Learning', 'Graph Neural Networks',
      'Federated Learning', 'Meta Learning', 'Continual Learning', 'Adversarial Learning',
      'Representation Learning', 'Causal Inference', 'Explainable AI', 'AI Safety'
    ];
    
    const topic = topics[i % topics.length];
    const subtopics = [
      'Architecture', 'Training', 'Optimization', 'Regularization', 'Analysis',
      'Applications', 'Theory', 'Benchmarking', 'Survey', 'Novel Method'
    ];
    const subtopic = subtopics[i % subtopics.length];
    
    const keywords = [
      topic.toLowerCase().replace(/\s+/g, ' '),
      subtopic.toLowerCase(),
      'deep learning',
      'neural networks'
    ];
    
    return {
      id,
      title: `${topic} ${subtopic}: A Comprehensive Study`,
      authors: [`Author ${i + 1}`, `Researcher ${i + 2}`, `Scientist ${i + 3}`],
      abstract: `This paper presents a comprehensive study on ${topic.toLowerCase()} focusing on ${subtopic.toLowerCase()}. We propose novel methods and demonstrate significant improvements over existing approaches. Our experimental results show promising performance across multiple benchmarks and datasets.`,
      year,
      citations,
      venue,
      venueType,
      url: `https://arxiv.org/abs/${year}.${String(i + 1000).padStart(5, '0')}`,
      keywords,
      impact: citations > 10000 ? 'high' : citations > 1000 ? 'medium' : 'low'
    } as ResearchPaper;
  })
];

// Export functions from original scholarService
export * from './scholarService';