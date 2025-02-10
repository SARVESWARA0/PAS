import { NextResponse } from "next/server"
const Airtable = require("airtable")

const base = new Airtable({
  apiKey: "patyfDcedyFIgbnAE.d453878862966d0a8e6e210e2a57b2056aa6ce62f8d96ea597fc3d033b5a678e",
}).base("appBZJKmKN3iViICl")

export async function GET() {
  try {
    const { colleges, departments } = await fetchData()
    return NextResponse.json({ colleges, departments })
  } catch (error) {
    console.error("Error fetching data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("Received data in API route:", data)
    console.log("recordId in API route:", data.recordId)

    if (!data.recordId) {
      const record = await createCandidate(data)
      return NextResponse.json({
        success: true,
        message: "Candidate registration successful",
        recordId: record.getId(),
      })
    } else {
      // Handle assessment submission
      await updateCandidateStatus(data.recordId, "completed")
      // Process assessment data here
      return NextResponse.json({
        success: true,
        message: "Assessment submitted successfully",
      })
    }
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

async function fetchData(): Promise<{ colleges: string[]; departments: string[] }> {
  return new Promise((resolve, reject) => {
    const colleges: Set<string> = new Set()
    const departments: Set<string> = new Set()

    base("college")
      .select({ maxRecords: 100, view: "Grid view" })
      .eachPage(
        (records: any[], fetchNextPage: () => void) => {
          records.forEach((record) => {
            if (record.get("collegeName")) colleges.add(record.get("collegeName"))
            if (record.get("Department")) departments.add(record.get("Department"))
          })
          fetchNextPage()
        },
        (err: any) => {
          if (err) {
            reject(err)
          } else {
            resolve({
              colleges: Array.from(colleges),
              departments: Array.from(departments),
            })
          }
        },
      )
  })
}

interface AirtableRecord {
  getId(): string;
}

async function createCandidate(data: any) {
  return new Promise<AirtableRecord>((resolve, reject) => {
    base("Candidate").create(
      {
        Name: data.name,
        College: data.college,
        Department: data.department,
        phone_number: data.phone,
        Email: data.email,
        Status: "ongoing",
      },
      (err: any, record: AirtableRecord) => {
        if (err) {
          console.error(err)
          reject(err)
        } else {
          console.log("Created record ID:", record.getId())
          resolve(record)
        }
      },
    )
  })
}

async function updateCandidateStatus(recordId: string, status: string) {
  return new Promise((resolve, reject) => {
    base("Candidate").update(recordId, { Status: status }, (err: any, record: any) => {
      if (err) {
        reject(err)
      } else {
        resolve(record)
      }
    })
  })
}

