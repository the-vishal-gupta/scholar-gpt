import type { AuthorProfile, ResearchPaper } from '@/types';

// Mock author database
export const mockAuthorsDB: AuthorProfile[] = [
  {
    id: 'hinton',
    name: 'Geoffrey Hinton',
    affiliation: 'University of Toronto, Google DeepMind',
    hIndex: 168,
    i10Index: 394,
    totalCitations: 521847,
    citationsPerYear: [
      { year: 2020, count: 45231 },
      { year: 2021, count: 52847 },
      { year: 2022, count: 58394 },
      { year: 2023, count: 61285 },
      { year: 2024, count: 48392 }
    ],
    interests: ['Deep Learning', 'Neural Networks', 'Machine Learning', 'Artificial Intelligence'],
    publications: 394,
    coAuthors: ['Yann LeCun', 'Yoshua Bengio', 'Alex Krizhevsky', 'Ilya Sutskever'],
    topPapers: [],
    googleScholarId: 'JicYPdAAAAAJ',
    orcid: '0000-0002-1364-8017'
  },
  {
    id: 'lecun',
    name: 'Yann LeCun',
    affiliation: 'New York University, Meta AI',
    hIndex: 142,
    i10Index: 312,
    totalCitations: 398472,
    citationsPerYear: [
      { year: 2020, count: 38294 },
      { year: 2021, count: 42847 },
      { year: 2022, count: 47392 },
      { year: 2023, count: 51284 },
      { year: 2024, count: 39847 }
    ],
    interests: ['Computer Vision', 'Deep Learning', 'Convolutional Networks', 'Self-Supervised Learning'],
    publications: 312,
    coAuthors: ['Geoffrey Hinton', 'Yoshua Bengio', 'Leon Bottou', 'Ronan Collobert'],
    topPapers: [],
    googleScholarId: 'WLN3QrAAAAAJ'
  },
  {
    id: 'bengio',
    name: 'Yoshua Bengio',
    affiliation: 'University of Montreal, Mila',
    hIndex: 134,
    i10Index: 287,
    totalCitations: 342891,
    citationsPerYear: [
      { year: 2020, count: 32847 },
      { year: 2021, count: 38294 },
      { year: 2022, count: 41847 },
      { year: 2023, count: 45392 },
      { year: 2024, count: 35284 }
    ],
    interests: ['Deep Learning', 'Representation Learning', 'Generative Models', 'AI Safety'],
    publications: 287,
    coAuthors: ['Geoffrey Hinton', 'Yann LeCun', 'Aaron Courville', 'Ian Goodfellow'],
    topPapers: [],
    googleScholarId: 'kukA0LcAAAAJ'
  },
  {
    id: 'ng',
    name: 'Andrew Ng',
    affiliation: 'Stanford University, Landing AI',
    hIndex: 98,
    i10Index: 234,
    totalCitations: 198472,
    citationsPerYear: [
      { year: 2020, count: 18294 },
      { year: 2021, count: 21847 },
      { year: 2022, count: 24392 },
      { year: 2023, count: 26284 },
      { year: 2024, count: 19847 }
    ],
    interests: ['Machine Learning', 'Deep Learning', 'Computer Vision', 'Robotics'],
    publications: 234,
    coAuthors: ['Daphne Koller', 'Michael Jordan', 'Sebastian Thrun', 'Pieter Abbeel'],
    topPapers: [],
    googleScholarId: 'mG4imMEAAAAJ'
  }
];

export function searchAuthors(query: string): AuthorProfile[] {
  const lowerQuery = query.toLowerCase();
  return mockAuthorsDB.filter(author => 
    author.name.toLowerCase().includes(lowerQuery) ||
    author.affiliation.toLowerCase().includes(lowerQuery) ||
    author.interests.some(interest => interest.toLowerCase().includes(lowerQuery))
  );
}

export function getAuthorById(id: string): AuthorProfile | null {
  const author = mockAuthorsDB.find(a => a.id === id);
  if (!author) return null;
  
  return {
    ...author,
    topPapers: []
  };
}

export function getTopAuthors(limit: number = 10): AuthorProfile[] {
  return mockAuthorsDB
    .sort((a, b) => b.totalCitations - a.totalCitations)
    .slice(0, limit)
    .map(author => ({
      ...author,
      topPapers: []
    }));
}