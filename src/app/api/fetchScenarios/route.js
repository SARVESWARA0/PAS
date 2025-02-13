"use server";
import Airtable from "airtable";
import { NextResponse } from "next/server";

const getAirtableRecords = async () => {
  return new Promise((resolve, reject) => {
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY, 
    }).base(process.env.AIRTABLE_BASE_ID); 

    const allRecords = [];

    base("Topic")
      .select({ view: "Grid view" })
      .eachPage(
        (records, fetchNextPage) => {
          records.forEach((record) => {
            const { fields } = record;
            // Filter so that only rows with status 'published' and all required fields are added
            if (
              fields.status === "published" &&
              fields.topic &&
              fields.timer &&
              fields.header &&
              fields.question
            ) {
              allRecords.push(fields);
            }
          });
          
          fetchNextPage();
        },
        (err) => {
          if (err) reject(err);
          else resolve(allRecords);
        }
      );
  });    
};

const getRandomScenarios = (scenarios) => {
  const getRandomItems = (arr, count) => {
    let shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const groupedScenarios = scenarios.reduce((acc, scenario) => {
    acc[scenario.topic] ??= [];
    acc[scenario.topic].push(scenario);
    return acc;
  }, {});

  return Object.keys(groupedScenarios).reduce((acc, topic) => {
    const topicScenarios = getRandomItems(groupedScenarios[topic], 2);
    return [...acc, ...topicScenarios];
  }, []);
};

// Fix 1: Export the correct Next.js API route handler
export async function POST(request) {
  try {
    const scenarios = await getAirtableRecords();
    if (scenarios.length === 0) {
      return NextResponse.json({ error: "No scenarios found" }, { status: 404 });
    }

    const selectedScenarios = getRandomScenarios(scenarios);
    console.log("Selected scenarios:", selectedScenarios);
    return NextResponse.json(selectedScenarios);
  } catch (error) {
    console.error("Error fetching Airtable records:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}