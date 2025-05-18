// API route for observations

export default function handler(req, res) {
  // Sample observation data
  const observations = [
    {
      id: 1,
      species: "Monarch Butterfly",
      date: "2023-09-15",
      location: "Forest Park",
      notes: "Observed feeding on milkweed",
      status: "verified"
    },
    {
      id: 2,
      species: "Eastern Bluebird",
      date: "2023-09-12",
      location: "Meadow Creek",
      notes: "Nesting in birdhouse",
      status: "pending"
    },
    {
      id: 3,
      species: "American Toad",
      date: "2023-09-10",
      location: "Wetland Preserve",
      notes: "Found under log near pond",
      status: "verified"
    },
    {
      id: 4,
      species: "White-tailed Deer",
      date: "2023-09-08",
      location: "Oak Ridge Trail",
      notes: "Doe with two fawns",
      status: "verified"
    },
    {
      id: 5,
      species: "Great Blue Heron",
      date: "2023-09-05",
      location: "River Bend",
      notes: "Fishing in shallow water",
      status: "pending"
    }
  ];

  // Return the observations data
  res.status(200).json(observations);
}
