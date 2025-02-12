"use server";
import { NextResponse } from "next/server";
const Airtable = require("airtable");

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID);

export async function GET() {
  try {
    const { colleges, departments } = await fetchData();
    return NextResponse.json({ colleges, departments });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    console.log("Received data in API route:", data);
    console.log("recordId in API route:", data.recordId);

    if (!data.recordId) {
      const record = await createCandidate(data);
      return NextResponse.json({
        success: true,
        message: "Candidate registration successful",
        recordId: record.getId(),
      });
    } else {
      // Handle assessment submission
      await updateCandidateStatus(data.recordId, "completed");
      // Process assessment data here
      return NextResponse.json({
        success: true,
        message: "Assessment submitted successfully",
      });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function fetchData() {
  return new Promise((resolve, reject) => {
    const colleges = new Set();
    const departments = new Set();

    base("college")
      .select({ maxRecords: 100, view: "Grid view" })
      .eachPage(
        (records, fetchNextPage) => {
          records.forEach((record) => {
            if (record.get("collegeName")) colleges.add(record.get("collegeName"));
            if (record.get("Department")) departments.add(record.get("Department"));
          });
          fetchNextPage();
        },
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              colleges: Array.from(colleges),
              departments: Array.from(departments),
            });
          }
        }
      );
  });
}

async function createCandidate(data) {
  return new Promise((resolve, reject) => {
    base("Candidate").create(
      {
        Name: data.name,
        College: data.college,
        Department: data.department,
        phone_number: data.phone,
        Email: data.email,
        Status: "ongoing",
      },
      (err, record) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log("Created record ID:", record.getId());
          resolve(record);
        }
      }
    );
  });
}

async function updateCandidateStatus(recordId, status) {
  return new Promise((resolve, reject) => {
    base("Candidate").update(recordId, { Status: status }, (err, record) => {
      if (err) {
        reject(err);
      } else {
        resolve(record);
      }
    });
  });
}
