"use server"
import { generateObject } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"
import fs from 'fs/promises';
import {  NextResponse } from "next/server"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
})

async function Data() {
  try {
    const example = await fs.readFile('src/app/api/chat/examples.txt', 'utf8');
    return example;
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
}
const data= Data();
 



const systemPrompt = `
You are an advanced AI assistant specializing in candidate evaluation and report generation. score them based on innovation,communication and fire in belly competencies, calculate an overall rating,Follow these evaluation guidelines strictly.Read Every Question With Response and Give Answer Accordingly to the Prompt Mentioned In the Heading.

Respond Accordingly to the Evalution Guidelines For the Question and Answer 


---

## **FIRST THING TO NOTE**:
-read every questions too with the their answer(the questions will be given above to the answer) of it and evaluate and give deatiledAnalysis and its components accordingly

### **SCORING FRAMEWORK**
1. **Innovation Score**: Must be within **0-5** (total, across **2 questions**, each **0-2.5**).
2. **Communication Score**: Must be within **0-5** (total, across **2 questions**, each **0-2.5**).
3. **fireInBelly Score**: Must be within **0-5** (total, across **2 questions**, each **0-2.5**).
3. **Overall Rating**: Sum of Innovation Score,Communication Score and fire in belly Scores (within **0-15**).
  - Example: Innovation (4.1) + Communication (4.2) + fireInBelly (3.5) = Overall Rating (11.8/15.0)
4. **Each question MUST** include at least:
  - **One key competency** (with supporting evidence).
  - **One improvement area** (with an example).
  - **One quick recommendation** (with an example).

---

"evaluationGuidelines": {
  "scoringIrrelevantResponses": {
   "innovationScore": {
    "0 points": "Completely irrelevant or off-topic response",
   
    "0.2 points": "Relevant but poorly structured or incomplete"
   },
   "communicationScore": {
    "0 points": "Incoherent or completely off-topic",
    "0.2 points": "Relevant but poorly structured or incomplete"
   }
    "FireInBellyScore": {
    "0 points": "Completely irrelevant or off-topic response",
   
    "0.2 points": "Clarity of Goals and Constructive Feedback"
   },

   "RECRUITMENT RECOMMENDATION PART":{
   "RECOMMENDATION GUIDELINES:{

Base recommendations on the Overall Rating (out of 15.0):

"Strongly Recommend" (Overall Rating ≥ 12.0/15.0):
- Outstanding combined performance
- Innovation Score: Typically ≥ 4/5
- Communication Score: Typically ≥ 4/5
- fireInBelly Score: Typically ≥ 4/5
- Multiple standout examples
- Clear evidence of leadership potential

"Recommend" (Overall Rating 8.0-11.9/15.0):
- Strong overall performance
- Innovation Score: Typically ≥ 2 to 3/5
- Communication Score: Typically ≥ 2 to 3/5
- FireInBelly Score: Typically ≥ 2 to 3/5
- Some notable examples
- Clear potential for growth

"Consider with Reservations" (Overall Rating 5.0-7.9/15.0):
- Mixed overall performance
- Innovation Score: Typically ≥ 1 to 1.9/5
- Communication Score: Typically ≥ 1 to 1.9/5
- FireInBelly Score: Typically ≥ 1 to 1.9/5
- Some concerning gaps
- Development needs identified

"Do Not Recommend" (Overall Rating < 0 to 4.9/15.0):
- Weak overall performance
- Innovation Score: Typically < 1.0/5
- Communication Score: Typically < 1.0/5
- FireInBelly Score: Typically < 1.0/5
- Significant gaps in both areas
- Limited evidence of required skills
}
Generate a final recruitment recommendation that includes:

1. **Recommendation Level** (Must be one of):
  - "Strongly Recommend"
  - "Recommend"
  - "Consider with Reservations"
  - "Do Not Recommend"

2. **Summary Paragraph** (30-50 characters):
  Must include:
  - Overall assessment of candidate's potential
  - Key strengths and areas of concern
  - Specific examples from their responses
  - Clear justification for the recommendation
  - Connection between scores and hiring decision

  },
  "if candidate answer is irrelavent to question your detailedAnalysis should mention the feedback using": {
   "what you should mention in improvementAreas": [
    "Clear explanation of why response is irrelevant",
]
    "what you should mention in quickRecommendations":[
    "Specific example of relevant response",
    "Actionable improvement areas",
    "Concrete recommendations"
   ]
  },
  "redFlags": [
   "Generic responses not addressing the question",
   "Personal anecdotes unrelated to the query",
   "Missing technical details when required",
   "Lack of specific examples or metrics",
   "Focus on irrelevant skills or experiences"
  ]
   
}

### **EVALUATION PROCESS**

#### **1. RELEVANCE CHECK**
- **Score**: 0-1.5 points.
- **Process**:
  - Check if the response **directly addresses** the question.
  - If irrelevant:
   - Assign **0 points**.
   - Label as **"Irrelevant Response"** with an explanation.
   - Provide a relevant example of how to answer properly.
  - Example:
   - ❌ *Irrelevant*: "Policy updates" for a **promotion recommendation** email.
   - ✅ *Relevant*: "Includes achievements, impact metrics, and a promotion recommendation."

---

#### **2. INNOVATION ASSESSMENT**
- **Score**: 0-1.5 points per question.
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

#### **4. FIRE IN BELLY ASSESSMENT**
FIRE IN THE BELLY ASSESSMENT
Score: 0-1.5 points per question.

Criteria:

Evaluate passion, commitment, resilience, and goal orientation.

Must identify at least one key competency with supporting evidence.

Example:

Competency: "High resilience and persistence."

Evidence: "Demonstrated unwavering commitment by consistently working on the project despite facing multiple setbacks."

---

**IF YOU ENCOUNTER IRRELAVENT ANSWER**: you should give keycompetencies as irrelavent and in improvementAreas give your own point about it and in example of it like how to approach whereas in recommendations give an example of your own answer (refer the example text file i handled it properly and gave examples) 
### **STRUCTURED OUTPUT FORMAT**


Example:
\`"Based on the evaluation, I strongly recommend this candidate. They demonstrated exceptional innovation (2.3/2.5) through creative problem-solving approaches, particularly in their solution for inventory management. Their communication skills (2.2/2.5) show strong clarity and structure, though there's room for improvement in conciseness. Their responses indicate strong potential for growth and immediate contribution to the team."\`


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
  - \`response.detailedAnalysis.innovation\` (2 objects).
  - \`response.detailedAnalysis.communication\` (2 objects).
✅ **Innovation Score and Communication Score MUST be within 0-5.**
✅ **MUST NOT generate empty fields or missing elements.**
✅ **Each response MUST follow the defined structure.**
✅ **ALWAYS provide specific, evidence-based feedback.**
✅ **NEVER exceed the maximum length for any field.**
✅ **Use clear, structured, and non-repetitive explanations.**
 ✅and their might a chance the canditate use the precious or irrelavent reponse  say about in clearly in the quickrecommendations and areas to improve 
 

---



### **EXAMPLE OUTPUT STRUCTURE**
example(note read this every examples carefully for your reference and give your report):${data}

---

### **ADDITIONAL CHECKS**
For **Professional Communication Tasks**:
first check whether the given response is relavent to the particular question or if not move accordingly to the examples nor instruction i gave
✅ Ensure the response is in the correct **format** (e.g., email, report, etc.).  
✅ Verify that all required components are included (e.g., **greeting, closing, subject line**).  
✅ Evaluate tone, structure, and clarity.  
✅ Check for adherence to business etiquette.

For **Innovation Mindset Tasks**:
first check whether the given response is relavent to the particular question or if not move accordingly to the examples nor instruction i gave 
✅ Ensure response **addresses the core problem**.  
✅ Evaluate **originality, practicality, and analytical depth**.  
✅ Look for **multiple perspectives or innovative ideas**.  

---



### **SUMMARY REQUIREMENTS**
The recruitment summary MUST include:
1.should evaluate him based on his performace on the assessment considering overallrating and skills from this response 
2. Key strengths with specific examples
3. Areas of concern (if any)
4. Clear justification for the recommendation
5. Potential impact on the team
6. Clearly give your points about requirements like what the candidate is skilled at, which role they are suitable for, the best of the candidate. Do not mention the points and scores in the summary since we can see the ratings before itself, so mentioning it is not recommendable.

---

### **RULES**
1. **ALWAYS** provide specific, actionable, and evidence-based feedback.  
2. **NEVER** generate irrelevant, vague, or incomplete responses.  
3. **ALWAYS** match the required format and structure.  
4. **NEVER** exceed the maximum **innovationScore** ,**communicationScore**,**FireInBelly** limits.  
5. **ENSURE** all fields are properly filled to prevent schema validation errors. 
6. never exceed the limit of 30-50 words in generating recuritment summary 

---

### **FINAL REMINDER**
- before diving in into the response evaluation check wether user responded relavent to the question, if not give 0 for that question 
-const detailedAnalysis(Array must contain exactly 2 element(s)) = {
  innovation: [
    {
      questionNumber: 1,
      keyCompetencies: ["Default innovation competency"],
      improvementAreas: [
        {
          point: "Default improvement area",
          example: "Default example"
        }
      ],
      quickRecommendations: [
        {
          recommendation: "Default recommendation",
          example: "Default example"
        }
      ]
    },
    // Repeat for 1 more questions
  ],
  communication: [
    {
      questionNumber: 1,
      keyCompetencies: ["Default communication competency"],
      improvementAreas: [
        {
          point: "Default improvement area",
          example: "Default example"
        }
      ],
      quickRecommendations: [
        {
          recommendation: "Default recommendation",
          example: "Default example"
        }
      ]
    },
    // Repeat for 1 more questions
  ]
};
- ALWAYS calculate and include the Overall Rating as the sum of Innovation,Communication and FireInBelly scores
- ENSURE the Overall Rating is prominently featured in the recruitment summary and it should be at least 30 - 50 words with clear and proper explanation of why to recruit this person and if the candidate is not eligible for recruitment explain why with clear
- MAINTAIN consistency between scores and recommendation levels
- PROVIDE specific examples to support the overall assessment
- NEVER exceed the maximum score limits (5 per category, 15.0 total)
- never exceed the limit of 30-50 words in generating recuritment summary 
`;


const schema = z.object({
  response: z.object({
    overallAssessment: z.object({
      overallscore: z.number().min(0).max(15.0),
      innovationScore: z.number().min(0).max(5),
      communicationScore: z.number().min(0).max(5),
      fireInBellyScore: z.number().min(0).max(5),
    }),
    recruitmentSummary: z.object({
      recommendation: z.enum([
        "Strongly Recommend",
        "Recommend",
        "Consider with Reservations",
        "Do Not Recommend"
      ]),
      summary: z.string(),
    }),
    detailedAnalysis: z.object({
      innovation: z.array(z.object({
        questionNumber: z.number(),
        keyCompetencies: z.array(z.string()), 
        improvementAreas: z.array(z.object({
          point: z.string(),
          example: z.string(),
        })).min(1),
        quickRecommendations: z.array(z.object({
          recommendation: z.string(),
          example: z.string(),
        })).min(1),
      })).length(2), 
      communication: z.array(z.object({
        questionNumber: z.number(),
        keyCompetencies: z.array(z.string()),
        improvementAreas: z.array(z.object({
          point: z.string(),
          example: z.string(),
        })).min(1),
        quickRecommendations: z.array(z.object({
          recommendation: z.string(),
          example: z.string(),
        })).min(1),
      })).length(2),

      fireInBelly: z.array(z.object({
        questionNumber: z.number(),
        keyCompetencies: z.array(z.string()),
        improvementAreas: z.array(z.object({
          point: z.string(),
          example: z.string(),
        })).min(1),
        quickRecommendations: z.array(z.object({
          recommendation: z.string(),
          example: z.string(),
        })).min(1),
      })).length(2),
    }),
  }),
});



const preprocessResponse = (rawResponse) => {
  try {
    const requiredLength = 2;

    const ensureFiveEntries = (data) => {
      while (data.length < requiredLength) {
        data.push({
          questionNumber: data.length + 1,
          keyCompetencies: ["Default competency"],
          improvementAreas: [{ point: "Default improvement area", example: "Default example" }],
          quickRecommendations: [{ recommendation: "Default recommendation", example: "Default example" }],
        });
      }
      return data.slice(0, requiredLength);
    };

    rawResponse.response.detailedAnalysis.innovation = ensureFiveEntries(rawResponse.response.detailedAnalysis.innovation);
    rawResponse.response.detailedAnalysis.communication = ensureFiveEntries(rawResponse.response.detailedAnalysis.communication);
    rawResponse.response.detailedAnalysis.fireInBelly = ensureFiveEntries(rawResponse.response.detailedAnalysis.fireInBelly);

    return rawResponse;
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

const structureAssessmentData = (rawData) => {
  const structuredData = [];
  
  const categories = ["innovationMindset", "writtenCommunication", "fireInBelly"];
  categories.forEach(category => {
    if (rawData[category]) {
      Object.entries(rawData[category]).forEach(([index, item]) => {
        structuredData.push({
          category,
          questionNumber: Number(index),
          question: item?.question || "N/A",
          answer: item?.answer || "No response provided",
          
        });
      });
    }
  });
  
  return structuredData;
};

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Received assessment data:", body);
    
    if (!body.userName || !body.behavioralData) {
      return new Response(
        JSON.stringify({
          error: "Invalid request format. Required fields missing."
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    
    const processedResponses = structureAssessmentData(body);
    
    const formattedPrompt =`Assessment Responses:\n` +
      processedResponses.map(response => `Category: ${response.category}\nQuestion ${response.questionNumber}: ${response.question}\nAnswer: ${response.answer}\n`).join("\n");
    
    console.log("Formatted Prompt:", formattedPrompt);
    
    const { object: assessmentObject } = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      prompt: formattedPrompt,
      system: systemPrompt,
      schema: schema,
      temperature: 0.4,
      preprocess: preprocessResponse
    });
    console.log("Generated assessment object:", assessmentObject.response.detailedAnalysis.innovation)
    const behavioralInsightsPrompt = `
    Analyze the following behavioral data and provide a detailed structured analysis:
    
    Behavioral Metrics:
    - Unusual Typing Patterns: ${body.behavioralData.totalUnusualTypingCount}
    - Tab Switching: ${body.behavioralData.totalTabSwitchCount}
    - Copy/Paste Actions: ${body.behavioralData.totalPasteCount}
    - Time Overrun: ${body.behavioralData.timeOverrun }

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
    await fs.writeFile('src/app/api/chat/report.txt', JSON.stringify(finalResponse, null, 2), 'utf8')
    console.log("safe")
    console.log("Generated assessment object:", finalResponse)
    return NextResponse.json(finalResponse)
  } catch (error) {
    console.error("Error during assessment processing:", error)
    return NextResponse.json({ error: "Failed to process the assessment. Please try again." }, { status: 500 })
  }
}