import { NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function POST(request) {
  try {
    const { key } = await request.json();

    // Use environment variables for configuration
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    if (!apiKey || !baseId) {
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    const base = new Airtable({ apiKey }).base(baseId);
    let validKeys = [];

    // Wrap the Airtable call in a promise
    await new Promise((resolve, reject) => {
      base('Security').select({
        view: "Grid view"
      }).eachPage(
        function page(records, fetchNextPage) {
          records.forEach(record => {
            if (record.fields.status === 'ongoing') {
              validKeys.push(record.fields.key);
            }
          });
          fetchNextPage();
        },
        function done(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    if (validKeys.includes(key)) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: "Invalid key" });
    }
  } catch (error) {
    console.error("Error validating key:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
