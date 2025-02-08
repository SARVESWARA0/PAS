import Airtable from "airtable"

interface Scenario {
  topic: string
  timer: number
  Headers: string
  Question: string
}

const getAirtableRecords = async (): Promise<Scenario[]> => {
  return new Promise((resolve, reject) => {
    const base = new Airtable({
      apiKey: 'patyfDcedyFIgbnAE.d453878862966d0a8e6e210e2a57b2056aa6ce62f8d96ea597fc3d033b5a678e',
    }).base("appBZJKmKN3iViICl")

    const allRecords: Scenario[] = []

    base("Topic")
      .select({
        maxRecords: 100,
        view: "Grid view",
      })
      .eachPage(
        (records, fetchNextPage) => {
          records.forEach((record) => {
            const fields = record.fields as unknown as Scenario
            if (fields.topic && fields.timer && fields.Headers && fields.Question) {
              allRecords.push(fields)
            }
          })
          fetchNextPage()
        },
        (err) => {
          if (err) {
            reject(err)
          } else {
            resolve(allRecords)
          }
        },
      )
  })
}

const getRandomScenarios = (scenarios: Scenario[]): Scenario[] => {
  const getRandomItems = <T>(arr: T[], count: number): T[] => {
    let shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const groupedScenarios: Record<string, Scenario[]> = scenarios.reduce(
    (acc: Record<string, Scenario[]>, scenario: Scenario) => {
      acc[scenario.topic] ??= [];
      acc[scenario.topic].push(scenario);
      return acc;
    },
    {}
  );

  const randomScenarios = Object.keys(groupedScenarios).reduce(
    (acc: Scenario[], topic) => {
      const topicScenarios = getRandomItems(groupedScenarios[topic], 2);
      return [...acc, ...topicScenarios];
    },
    []
  );

  return randomScenarios;
};

export const fetchScenarios = async (): Promise<Scenario[]> => {
  try {
    const scenarios: Scenario[] = await getAirtableRecords();
    if (scenarios.length === 0) {
      throw new Error('No scenarios fetched from Airtable');
    }
    const selectedScenarios = getRandomScenarios(scenarios);
    console.log('Selected scenarios:', selectedScenarios);
    return selectedScenarios;
  } catch (error) {
    console.error('Error fetching Airtable records:', error);
    return [];
  }
};

