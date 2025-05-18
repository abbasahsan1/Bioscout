// This file exports the species database for use in the RAG system

// Mapping of scientific names to common names for species found in Margalla Hills
export const speciesDatabase: Record<string, string> = {
  // Mammals
  'Felis catus': 'Domestic Cat',
  'Canis lupus familiaris': 'Domestic Dog',
  'Panthera pardus': 'Leopard',
  'Panthera pardus saxicolor': 'Persian Leopard',
  'Ursus thibetanus': 'Asiatic Black Bear',
  'Vulpes bengalensis': 'Bengal Fox',
  'Canis aureus': 'Golden Jackal',
  'Hystrix indica': 'Indian Crested Porcupine',
  'Macaca mulatta': 'Rhesus Macaque',
  'Herpestes edwardsii': 'Indian Grey Mongoose',
  
  // Birds
  'Aquila chrysaetos': 'Golden Eagle',
  'Bubo bubo': 'Eurasian Eagle-Owl',
  'Columba livia': 'Rock Pigeon',
  'Anas platyrhynchos': 'Mallard Duck',
  'Anser anser': 'Greylag Goose',
  'Passer domesticus': 'House Sparrow',
  'Acridotheres tristis': 'Common Myna',
  'Psittacula krameri': 'Rose-ringed Parakeet',
  'Athene brama': 'Spotted Owlet',
  'Corvus splendens': 'House Crow',
  'Upupa epops': 'Hoopoe',
  'Streptopelia decaocto': 'Eurasian Collared-Dove',
  'Francolinus pondicerianus': 'Grey Francolin',
  'Neophron percnopterus': 'Egyptian Vulture',
  
  // Reptiles & Amphibians
  'Naja naja': 'Indian Cobra',
  'Echis carinatus': 'Saw-scaled Viper',
  
  // Plants
  'Pinus roxburghii': 'Chir Pine',
  'Acacia modesta': 'Phulai',
  'Dalbergia sissoo': 'Shisham',
  'Melia azedarach': 'Chinaberry Tree',
  'Bauhinia variegata': 'Orchid Tree',
  'Pinus wallichiana': 'Blue Pine',
  'Cedrus deodara': 'Himalayan Cedar',
  'Ficus religiosa': 'Sacred Fig',
  'Broussonetia papyrifera': 'Paper Mulberry'
};

// Species descriptions for more detailed information
export const speciesDescriptions: Record<string, string> = {
  // Mammals
  'Panthera pardus': 'The Common Leopard is an apex predator in Margalla Hills. It primarily feeds on wild boar, barking deer, and monkeys. Despite urbanization, leopards have adapted to living in proximity to human settlements in Islamabad.',
  'Panthera pardus saxicolor': 'The Persian Leopard is a subspecies of leopard native to West Asia. In Margalla Hills, it represents one of the most important large predators in the ecosystem. They are solitary and primarily nocturnal hunters.',
  'Ursus thibetanus': 'The Asiatic Black Bear can be found in the more remote areas of Margalla Hills. These bears have a distinctive white V-shaped mark on their chest and are primarily nocturnal. They have an omnivorous diet consisting of fruits, nuts, insects, small mammals, and carrion.',
  'Hystrix indica': 'The Indian Crested Porcupine is one of the notable mammals found in Margalla Hills. These large rodents are characterized by their black and white quills that can grow up to 30cm long. They are nocturnal herbivores, feeding primarily on roots, tubers, and bark.',
  'Macaca mulatta': 'The Rhesus Macaque is a common primate species in the Margalla Hills. These social animals live in groups and have adapted to human presence, often coming into contact with visitors and residents near the hills. They can frequently be seen along hiking trails and at viewpoints.',
  'Vulpes bengalensis': 'The Bengal Fox is a small fox native to the Indian subcontinent. In Margalla Hills, these foxes are mostly nocturnal and feed on rodents, reptiles, and insects. They typically live in pairs and dig burrows for shelter.',
  
  // Birds
  'Columba livia': 'The Rock Pigeon is one of the most commonly observed birds in the Margalla Hills and Islamabad area. These medium-sized birds have adapted well to urban environments while maintaining populations in natural habitats. They typically have bluish-gray plumage with two dark wingbars and iridescent throat feathers.',
  'Streptopelia decaocto': 'The Eurasian Collared-Dove is recognizable by the black collar on the back of its neck. Common throughout Margalla Hills, these birds feed on seeds, grains and berries. They typically nest in trees and shrubs.',
  'Passer domesticus': 'The House Sparrow is a small, sturdy bird with brown, black, and gray plumage. Males have distinctive black bibs. They are highly adaptable and can be found in both urban areas of Islamabad and throughout Margalla Hills.',
  'Acridotheres tristis': 'The Common Myna is an omnivorous bird with a yellow bill and legs. These highly social birds are known for their intelligence and ability to mimic sounds. They are abundant throughout Margalla Hills and Islamabad.',
  'Psittacula krameri': 'The Rose-ringed Parakeet is a bright green, medium-sized parrot with a red ring around its neck (in males). These vocal birds feed mainly on fruits, seeds, and nectar. They nest in tree cavities throughout Margalla Hills.',
  'Athene brama': 'The Spotted Owlet is a small owl with spotted brown and white plumage. These nocturnal birds of prey feed on insects, small mammals, and reptiles. They typically nest in tree hollows in Margalla Hills.',
  'Upupa epops': 'The Hoopoe is easily recognizable by its distinctive crown of feathers and long, thin downcurved bill. These birds primarily feed on insects and can be spotted in open areas of Margalla Hills, using their bills to probe the soil for food.',
  
  // Plants
  'Pinus roxburghii': 'The Chir Pine is an evergreen tree native to the Himalayas. In Margalla Hills, these trees can grow up to 55m tall with distinctive long needles arranged in bundles of three. They are drought-resistant and well-adapted to the hilly terrain.',
  'Dalbergia sissoo': 'Shisham is a deciduous rosewood tree native to the Indian subcontinent. These trees have distinctive compound leaves and provide valuable hardwood. They are commonly found in the lower regions of Margalla Hills.',
  'Acacia modesta': 'Phulai is a moderate-sized thorny tree native to Pakistan and India. In Margalla Hills, these trees are well-adapted to dry conditions and have small, feathery leaves. They play an important role in preventing soil erosion on the hills.',
  'Melia azedarach': 'The Chinaberry Tree is a deciduous tree with dark green compound leaves and lilac flowers. The tree produces yellow berries which are poisonous to humans but eaten by some bird species. It\'s common on the lower slopes of Margalla Hills.',
  'Ficus religiosa': 'The Sacred Fig or Peepal tree has distinctive heart-shaped leaves with a long pointed tip. These trees can live for hundreds of years and are culturally significant in the region. They provide shelter and food for various wildlife species in Margalla Hills.'
}; 