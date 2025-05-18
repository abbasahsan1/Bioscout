// This file provides a simple offline Q&A system until the RAG system can be integrated with Firebase

interface QuestionMatch {
  keywords: string[];
  answer: string;
}

// Predefined Q&A pairs about Islamabad's biodiversity
const predefinedAnswers: QuestionMatch[] = [
  {
    keywords: ['margalla', 'hills', 'species', 'biodiversity'],
    answer: 'Margalla Hills National Park in Islamabad hosts over 600 plant species, 250 bird species, 38 mammals, and 13 reptile species. It\'s the city\'s primary habitat for local wildlife and offers important ecological services to the region.'
  },
  {
    keywords: ['leopard', 'common', 'panthera'],
    answer: 'The Common Leopard (Panthera pardus) is considered an apex predator in Margalla Hills. It primarily feeds on wild boar, barking deer, and monkeys. Despite urbanization, leopards have adapted to living in proximity to human settlements in Islamabad. The Persian Leopard (Panthera pardus saxicolor) is a subspecies that can sometimes be found in the region.'
  },
  {
    keywords: ['cheetah', 'acinonyx'],
    answer: 'Cheetahs (Acinonyx jubatus) are not native to or found in Margalla Hills National Park or Pakistan. The big cats present in Margalla Hills include the Common Leopard (Panthera pardus) and occasionally the Persian Leopard (Panthera pardus saxicolor). Cheetahs historically ranged across parts of the Indian subcontinent but are now extinct in the region. The nearest wild cheetah populations are currently found in Iran and parts of Africa.'
  },
  {
    keywords: ['bird', 'rawal', 'lake', 'migratory'],
    answer: 'Rawal Lake serves as a critical water source for Islamabad and attracts numerous migratory birds from Central Asia during winter months (November to February). Common visitors include the Common Pochard, Northern Pintail, and Common Teal.'
  },
  {
    keywords: ['birds', 'species', 'margalla', 'hills'],
    answer: 'Margalla Hills hosts about 250 bird species including Rock Pigeon (Columba livia), Eurasian Collared-Dove (Streptopelia decaocto), House Sparrow (Passer domesticus), Common Myna (Acridotheres tristis), Rose-ringed Parakeet (Psittacula krameri), Spotted Owlet (Athene brama), and Hoopoe (Upupa epops). Many of these birds are year-round residents, while others are seasonal migrants.'
  },
  {
    keywords: ['tree', 'plant', 'pine', 'chir', 'flora'],
    answer: 'Islamabad\'s vegetation includes a variety of trees such as Chir Pine (Pinus roxburghii), Blue Pine (Pinus wallichiana), Shisham (Dalbergia sissoo), Phulai (Acacia modesta), and Paper Mulberry (Broussonetia papyrifera). The Chir Pine is particularly abundant in the Margalla Hills, while Paper Mulberry, though non-native, has become invasive and contributes to pollen allergies in the region.'
  },
  {
    keywords: ['climate', 'weather', 'season'],
    answer: 'Islamabad and the Margalla Hills experience a subtropical highland climate with five distinct seasons: winter (November-February), spring (March-April), summer (May-June), monsoon (July-August), and autumn (September-October). This climatic variation supports diverse ecological niches.'
  },
  {
    keywords: ['snake', 'reptile', 'cobra'],
    answer: 'The Potohar Plateau, where Islamabad is situated, has a rich diversity of reptile species including the Indian Cobra (Naja naja), Saw-scaled Viper (Echis carinatus), and Monitor Lizards. These species play crucial roles in controlling pest populations. Margalla Hills contains 13 known reptile species that are adapted to the hilly terrain.'
  },
  {
    keywords: ['monkey', 'macaque', 'rhesus'],
    answer: 'The Rhesus Macaque (Macaca mulatta) is a common primate species in the Margalla Hills. These social animals live in groups and have adapted to human presence, often coming into contact with visitors and residents near the hills. They can frequently be seen along hiking trails and at viewpoints.'
  },
  {
    keywords: ['mammals', 'species', 'margalla'],
    answer: 'Margalla Hills is home to 38 mammal species including Persian Leopard (Panthera pardus saxicolor), Asiatic Black Bear (Ursus thibetanus), Indian Crested Porcupine (Hystrix indica), Bengal Fox (Vulpes bengalensis), Rhesus Macaque (Macaca mulatta), Indian Grey Mongoose (Herpestes edwardsii), and Golden Jackal (Canis aureus). Many of these mammals are nocturnal and rarely seen by visitors.'
  },
  {
    keywords: ['butterfly', 'insect', 'pollinator'],
    answer: 'Islamabad hosts several butterfly species like the Common Mormon (Papilio polytes), Lime Butterfly (Papilio demoleus), and Common Tiger (Danaus genutia). These insects serve as important pollinators for many plant species in the region. The diverse plant life of Margalla Hills supports a rich insect population including the Western Honey Bee (Apis mellifera).'
  },
  {
    keywords: ['conservation', 'threat', 'protect', 'endangered'],
    answer: 'Conservation efforts in Islamabad focus on protecting the Margalla Hills ecosystem from threats like deforestation, urban encroachment, and illegal hunting. The Capital Development Authority (CDA) and the Islamabad Wildlife Management Board work to preserve these natural habitats. The region faces challenges from habitat fragmentation, climate change, and human-wildlife conflicts.'
  },
  {
    keywords: ['pigeon', 'rock', 'columba'],
    answer: 'The Rock Pigeon (Columba livia) is one of the most commonly observed birds in the Margalla Hills and Islamabad area. These medium-sized birds have adapted well to urban environments while maintaining populations in natural habitats. They typically have bluish-gray plumage with two dark wingbars and iridescent throat feathers. Rock Pigeons are often seen in pairs or flocks and feed mainly on seeds and grains.'
  },
  {
    keywords: ['bear', 'asiatic', 'black'],
    answer: 'The Asiatic Black Bear (Ursus thibetanus) can be found in the more remote areas of Margalla Hills. These bears have a distinctive white V-shaped mark on their chest and are primarily nocturnal. They have an omnivorous diet consisting of fruits, nuts, insects, small mammals, and carrion. Due to habitat loss and human encroachment, sightings of Asiatic Black Bears in Margalla have become increasingly rare.'
  },
  {
    keywords: ['porcupine', 'indian', 'crested', 'hystrix'],
    answer: 'The Indian Crested Porcupine (Hystrix indica) is one of the notable mammals found in Margalla Hills. These large rodents are characterized by their black and white quills that can grow up to 30cm long. They are nocturnal herbivores, feeding primarily on roots, tubers, and bark. Porcupines often make their burrows in rocky areas of the hills and can sometimes be spotted during early morning or evening hours.'
  }
];

// Function to match a question to predefined answers
export function generateDefaultAnswer(question: string): string {
  const lowerCaseQuestion = question.toLowerCase();
  
  // Check for matches with predefined answers
  for (const qa of predefinedAnswers) {
    if (qa.keywords.some(keyword => lowerCaseQuestion.includes(keyword))) {
      return qa.answer;
    }
  }
  
  // Default answer if no match found
  return "I don't have specific information about that aspect of Islamabad's biodiversity. The region is home to a diverse ecosystem including the Margalla Hills National Park with hundreds of plant and animal species. Consider visiting the Islamabad Wildlife Management Board's resources for more detailed information.";
}
