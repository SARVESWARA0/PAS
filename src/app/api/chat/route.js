"use server"
import { generateObject } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"

import {  NextRequest, NextResponse } from "next/server"
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
})

const systemPrompt = `
You are an advanced AI assistant specializing in candidate evaluation and report generation. Your task is to assess user responses, score them based on innovation and communication competencies, and generate structured feedback that fosters growth. Follow these evaluation guidelines strictly.

---

### **SCORING FRAMEWORK**
1. **Overall Rating**: Sum of Innovation Score and Communication Score.
2. **Innovation Score**: Must be within **0-2.5** (total, across **5 questions**, each **0-0.5**).
3. **Communication Score**: Must be within **0-2.5** (total, across **5 questions**, each **0-0.5**).
4. **Each question MUST** include at least:
   - **One key competency** (with supporting evidence).
   - **One improvement area** (with an example).
   - **One quick recommendation** (with an example).

---

### **EVALUATION PROCESS**

#### **1. RELEVANCE CHECK**
- **Score**: 0-0.3 points.
- **Process**:
  - Check if the response **directly addresses** the question.
  - If irrelevant:
    - Assign **0 points**.
    - Label as **"Irrelevant Response"** with an explanation.
    - Provide a relevant example.
  - Example:
    - ❌ *Irrelevant*: "Policy updates" for a **promotion recommendation** email.
    - ✅ *Relevant*: "Includes achievements, impact metrics, and a promotion recommendation."

---

#### **2. INNOVATION ASSESSMENT**
- **Score**: 0-0.5 points per question.
- **Criteria**:
  - Evaluate **originality, problem-solving, feasibility, and unique perspectives**.
  - Must identify at least **one key competency** with **supporting evidence**.
  - Example:
    - **Competency**: "Creative problem-solving."
    - **Evidence**: "Proposed a novel solution: 'Utilizing AI-powered demand forecasting.'"

---

#### **3. COMMUNICATION ASSESSMENT**
- **Score**: 0-0.5 points per question.
- **Criteria**:
  - Assess **clarity, structure, tone, organization, and audience awareness**.
  - Must identify at least **one key competency** with **supporting evidence**.
  - Example:
    - **Competency**: "Clear structure."
    - **Evidence**: "Used STAR format: 'When sales declined by 15%, implemented X strategy leading to Y results.'"

---

### **STRUCTURED OUTPUT FORMAT**

For each of the **5 questions**, generate:
1. **Key Competencies** (more than one  **minimum 2 required**):
   - Example: \`["Clear problem analysis", "Innovative solution approach"]\`

2. **Improvement Areas** (At least **one required**):
   - Example:
     - **Point**: \`"Response lacks specificity."\`
     - **Example**: \`"Instead of 'performed well,' specify: 'Led Q4 project exceeding targets by 30%.'"\`

3. **Quick Recommendations** (At least **one required**):
   - Example:
     - **Recommendation**: \`"Replace generic phrases with specific achievements."\`
     - **Example**: \`"Change 'great job' to 'Improved team efficiency by 20% through agile methodology.'"\`

---

### **MANDATORY OUTPUT CONSTRAINTS**
✅ **MUST always return exactly 5 elements** in:
   - \`response.detailedAnalysis.innovation\` (5 objects).
   - \`response.detailedAnalysis.communication\` (5 objects).
✅ **Innovation Score and Communication Score MUST be within 0-2.5.**
✅ **MUST NOT generate empty fields or missing elements.**
✅ **Each response MUST follow the defined structure.**
✅ **ALWAYS provide specific, evidence-based feedback.**
✅ **NEVER exceed the maximum length for any field.**
✅ **Use clear, structured, and non-repetitive explanations.**

---

### **EXAMPLE OUTPUT STRUCTURE**
\`\`\`json
{
  "response": {
    "overallAssessment": {
      "innovationScore": 2.1,
      "communicationScore": 2.3
    },
    "detailedAnalysis": {
      "innovation": [
        {
          "questionNumber": 1,
          "keyCompetencies": ["Creative problem-solving"],
          "improvementAreas": [
            {
              "point": "Lacks depth in solution evaluation.",
              "example": "Consider discussing potential drawbacks of your approach."
            }
          ],
          "quickRecommendations": [
            {
              "recommendation": "Provide more concrete examples.",
              "example": "Instead of 'better teamwork,' state 'Implemented daily stand-ups, improving workflow by 30%.'"
            }
          ]
        },
        { ... } // (4 more objects following the same structure)
      ],
      "communication": [
        {
          "questionNumber": 1,
          "keyCompetencies": ["Clear structure"],
          "improvementAreas": [
            {
              "point": "Sentences are too long and complex.",
              "example": "Break long sentences into smaller, easier-to-read parts."
            }
          ],
          "quickRecommendations": [
            {
              "recommendation": "Use concise, structured writing.",
              "example": "Instead of 'a detailed explanation covering various aspects,' write 'a clear and concise summary.'"
            }
          ]
        },
        { ... } // (4 more objects following the same structure)
      ]
    }
  }
}
\`\`\`

---

### **ADDITIONAL CHECKS**
For **Professional Communication Tasks**:
✅ Ensure the response is in the correct **format** (e.g., email, report, etc.).  
✅ Verify that all required components are included (e.g., **greeting, closing, subject line**).  
✅ Evaluate tone, structure, and clarity.  
✅ Check for adherence to business etiquette.

For **Innovation Mindset Tasks**:
✅ Ensure response **addresses the core problem**.  
✅ Evaluate **originality, practicality, and analytical depth**.  
✅ Look for **multiple perspectives or innovative ideas**.  

---

### **RULES**
1. **ALWAYS** provide specific, actionable, and evidence-based feedback.  
2. **NEVER** generate irrelevant, vague, or incomplete responses.  
3. **ALWAYS** match the required format and structure.  
4. **NEVER** exceed the maximum **innovationScore** and **communicationScore** limits.  
5. **ENSURE** all fields are properly filled to prevent schema validation errors.  

---

### **FINAL REMINDER**
Your feedback must be **specific, structured, and actionable**.  
⚠ **Never return an empty field. Always generate 5 elements per category.**  
 Follow this structure strictly to ensure AI-generated outputs are valid.
`;



const schema = z.object({
  response: z.object({
    overallAssessment: z.object({
      innovationScore: z.number().min(0).max(2.5),
      communicationScore: z.number().min(0).max(2.5),
    }),
    detailedAnalysis: z.object({
      innovation: z.array(z.object({
        questionNumber: z.number(),
        keyCompetencies: z.array(z.string()),
        improvementAreas: z.array(z.object({
          point: z.string(),
          example: z.string(),
        })),
        quickRecommendations: z.array(z.object({
          recommendation: z.string(),
          example: z.string(),
        })),
      })).length(5),
      communication: z.array(z.object({
        questionNumber: z.number(),
        keyCompetencies: z.array(z.string()),
        improvementAreas: z.array(z.object({
          point: z.string(),
          example: z.string(),
        })),
        quickRecommendations: z.array(z.object({
          recommendation: z.string(),
          example: z.string(),
        })),
      })).length(5),
    }),
  }),
});

const preprocessResponse = (rawResponse) => {
  console.log("Raw AI Response:", JSON.stringify(rawResponse, null, 2));

  try {
    const response = {
      response: {
        overallAssessment: {
          innovationScore: rawResponse?.response?.overallAssessment?.innovationScore || 0,
          communicationScore: rawResponse?.response?.overallAssessment?.communicationScore || 0,
        },
        detailedAnalysis: {
          innovation: rawResponse?.response?.detailedAnalysis?.innovation || [],
          communication: rawResponse?.response?.detailedAnalysis?.communication || [],
        },
      },
    };

    const requiredLength = 5;

    // Ensure exactly 5 elements in innovation
    while (response.response.detailedAnalysis.innovation.length < requiredLength) {
      response.response.detailedAnalysis.innovation.push({
        questionNumber: response.response.detailedAnalysis.innovation.length + 1,
        keyCompetencies: ["Default innovation competency"],
        improvementAreas: [{
          point: "Default improvement area",
          example: "Default example"
        }],
        quickRecommendations: [{
          recommendation: "Default recommendation",
          example: "Default example"
        }]
      });
    }
    response.response.detailedAnalysis.innovation = response.response.detailedAnalysis.innovation.slice(0, requiredLength);

    // Ensure exactly 5 elements in communication
    while (response.response.detailedAnalysis.communication.length < requiredLength) {
      response.response.detailedAnalysis.communication.push({
        questionNumber: response.response.detailedAnalysis.communication.length + 1,
        keyCompetencies: ["Default communication competency"],
        improvementAreas: [{
          point: "Default improvement area",
          example: "Default example"
        }],
        quickRecommendations: [{
          recommendation: "Default recommendation",
          example: "Default example"
        }]
      });
    }
    response.response.detailedAnalysis.communication = response.response.detailedAnalysis.communication.slice(0, requiredLength);

    console.log("Preprocessed Response:", JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error("Error in preprocessing:", error);
    throw error;
  }
};

const behavioralSchema = z.object({
  behavioralAnalysis: z.object({
    timeEfficiency: z.object({
      rating: z.string(),
      observations: z.array(z.string()),
      impact: z.string()
    }),
    responsePatterns: z.object({
      patterns: z.array(z.string()),
      consistency: z.string(),
      concerns: z.array(z.string()).optional()
    }),
    interactionAnalysis: z.object({
      overview: z.string(),
      keyBehaviors: z.array(z.string()),
      recommendations: z.array(z.string())
    })
  })
})



export async function POST(req) {
  try {
    const body = await req.json()
    console.log("Received assessment data:", body)
    if (!body.innovationMindset || !body.professionalCommunication || !body.behavioralData) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid request format. Expected 'innovationMindset', 'professionalCommunication', and 'behavioralData' sections.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    const processedResponses = [
      ...Object.entries(body.innovationMindset).map(([index, data]) => ({
        type: "Innovation Mindset",
        question: data?.question || "N/A",
        response: data?.response || "No response provided",
      })),
      ...Object.entries(body.professionalCommunication).map(([index, data]) => ({
        type: "Professional Communication",
        subject: data?.subject || "N/A",
        context: data?.context || "N/A",
        instructions: data?.instructions || "N/A",
        response: data?.response || "No response provided",
      })),
    ]

    const combinedPrompt =`User Responses:\n${processedResponses.map((response) => {
      let baseInfo = `${response.type}\n`
      if (response.type === "Innovation Mindset") {
        baseInfo += `Question: ${response.question}\n`
      } else if (response.type === "Professional Communication") {
        baseInfo += `Subject: ${response.subject}\nContext: ${response.context}\nInstructions: ${response.instructions}\n`
      }
      return `${baseInfo}Response: ${response.response}`
    })}`

    console.log("Combined Prompt:", combinedPrompt)

    const { object: assessmentObject } = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      schema: schema,
      system:systemPrompt,
      temperature: 0.3,
      prompt: combinedPrompt,
      preprocess: preprocessResponse,
    })
    console.log("Generated assessment object:", assessmentObject.response.detailedAnalysis.innovation)
    const behavioralInsightsPrompt = `
    Analyze the following behavioral data and provide a detailed structured analysis:
    
    Behavioral Metrics:
    - Unusual Typing Patterns: ${body.behavioralData.totalUnusualTypingCount}
    - Tab Switching: ${body.behavioralData.totalTabSwitchCount}
    - Copy/Paste Actions: ${body.behavioralData.totalPasteCount}
    - Time Overrun: ${body.behavioralData.timeOverrun ? "Yes" : "No"}

    Please provide:
    1. Time Efficiency Analysis:
       - Rate the overall efficiency
       - List specific time-related observations
       - Describe the impact on assessment quality
    
    2. Response Pattern Analysis:
       - Identify consistent patterns
       - Note any irregularities
       - List potential concerns if any
    
    3. Interaction Analysis:
       - Provide an overview of interaction style
       - List key observed behaviors
       - Suggest improvements or recommendations
    
    Format the response according to the provided schema structure.
    `

    const { object: behavioralAnalysis } = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      schema: behavioralSchema,
      prompt: behavioralInsightsPrompt
    })

    const finalResponse = {
      ...assessmentObject.response,
      behavioralAnalysis: behavioralAnalysis.behavioralAnalysis
    }

    console.log("Generated assessment object:", finalResponse)
    return NextResponse.json(finalResponse)
  } catch (error) {
    console.error("Error during assessment processing:", error)
    return NextResponse.json({ error: "Failed to process the assessment. Please try again." }, { status: 500 })
  }
}