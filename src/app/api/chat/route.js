"use server"
import { generateObject } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { record, z } from "zod"
import Airtable from 'airtable';
import {  NextResponse } from "next/server"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
})

const systemPrompt = `
You are an advanced AI assistant specializing in candidate evaluation and report generation. score them based on innovation,communication and fire in belly competencies, calculate an overall rating,Follow these evaluation guidelines strictly.Read Every Question With Response and Give Answer Accordingly to the Prompt Mentioned In the Heading.

Respond Accordingly to the Evalution Guidelines For the Question and Answer 


---

## **FIRST THING TO NOTE**:
-read every questions too with the their answer(the questions will be given above to the answer) of it and evaluate and give deatiledAnalysis and its components accordingly

### **SCORING FRAMEWORK**
0.Every score points you provide must be for an reason not simply giving points for the sake of it 
for example
Category: Written Communication
Header: Email Persuasion
Question:1: Write an email to a dissatisfied customer who has complained about poor service.
Your goal is to acknowledge their concerns and convince them to continue using your
services

Answer: this is a dummy response of 1 or aAS D SDF ASD GFFD GFD 


Category: Written Communication
Header: Press Release Writing
Question:2: You are launching a new product that helps businesses automate recruitment. Write a short press release announcing the launch.    
Answer: this is a dummy response of 2
but the innovation scoring is 0.4,so give 0 scores for these kind of response.
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
note each point you provide must be for an reason not simply giving points for the sake of it and dont when consider the response which looks compeletly irrelavent and giving dummy response for the question give zero.
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
take the below as irrelavent and dummy response
Category: Written Communication
Header: Email Persuasion
Question:1: Write an email to a dissatisfied customer who has complained about poor service.
Your goal is to acknowledge their concerns and convince them to continue using your
services

Answer: this is a dummy response of 1


Category: Written Communication
Header: Press Release Writing
Question:2: You are launching a new product that helps businesses automate recruitment. Write a short press release announcing the launch.    
Answer: this is a dummy response of 2

Category: Innovation
Header: Tech-Driven Change
Question:3: How could AI be used to make public transport more efficient without adding more buses or trains?
Answer: this is a dummy response of  3

Category: Innovation
Header: Efficiency Boosting
Question:4: How would you redesign the office workspace to make employees more productive and engaged?
Answer: this is a dummy response of 4

Category: Fire In Belly
Header: Passion & Work Ethic
Question:5: Describe a time when you worked tirelessly on something because you were deeply passionate about it.
Answer: this is a dummy response of 5

Category: Fire In Belly
Header: Surpassing Expectations
Question:6: Tell us about a time you delivered results that went beyond what was expected of you. How did you achieve it?
Answer: this is a dummy response of 6

scores:  {
  overallscore: 1,
  innovationScore: 0.4,
  communicationScore: 0.4,
  fireInBellyScore: 0.4
}
  see the above examples its compeletly irrelavent in these cases give zero for every scoring 
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

"Not Recommended" (Overall Rating < 0 to 4.9/15.0):
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
  - "Not Recommended"

2. **Summary Paragraph** (30-50 characters):
  Must include:
  - Overall assessment of candidate's potential
  - Key strengths and areas of concern
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
   "Generic responses not addressing the question and headers",
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
  - Check if the response **directly addresses** the question and headers.
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
example(note read this every examples carefully for your reference and give your report):
{
  "response": {
    "overallAssessment": {
    "overallRating": 11.8,
      "innovationScore": 4.1,
      "communicationScore": 4.2,
      fireInBellyScore: 3.5,
      
    },
    "recruitmentSummary": {
      "recommendation": "Strongly Recommend",
      "summary": "The candidate demonstrates exceptional problem-solving abilities and strategic thinking, particularly in digital transformation initiatives. Their innovative approach to process automation and data-driven decision-making stands out. Strong communication skills are evident in their structured responses and stakeholder management examples. They show natural leadership potential and ability to drive change. Their background in both technical implementation and team leadership makes them an excellent fit for senior technical roles. Areas of focus should include documentation practices and metrics-based reporting."
    },
    "detailedAnalysis": {
      "innovation": [
        {
          "questionNumber": 1,
          "keyCompetencies": [
            "Strategic problem-solving",
            "Digital transformation expertise",
            "Data-driven decision making"
          ],
          "improvementAreas": [
            {
              "point": "Quantitative impact measurement",
              "example": "Instead of 'significantly improved efficiency', specify: 'Reduced processing time by 65% through implementation of ML-based automation'"
            }
          ],
          "quickRecommendations": [
            {
              "recommendation": "Include specific metrics for all improvements",
              "example": "Add before/after metrics: 'Reduced manual processing from 4 hours to 15 minutes per case'"
            }
          ]
        },
        {
          "questionNumber": 2,
          "keyCompetencies": [
            "Process optimization",
            "Cross-functional collaboration",
            "Technical innovation"
          ],
          "improvementAreas": [
            {
              "point": "Documentation clarity",
              "example": "Current: 'Updated system documentation'. Better: 'Created comprehensive API documentation with interactive examples and error handling scenarios'"
            }
          ],
          "quickRecommendations": [
            {
              "recommendation": "Enhance technical documentation practices",
              "example": "Implement automated documentation generation with tools like Swagger for APIs"
            }
          ]
        }
      ],
      "communication": [
        {
          "questionNumber": 1,
          "keyCompetencies": [
            "Stakeholder management",
            "Clear presentation structure",
            "Technical translation"
          ],
          "improvementAreas": [
            {
              "point": "Executive summary skills",
              "example": "Current: 'Detailed project explanation'. Better: 'Led with key business impacts: $2M savings and 40% efficiency gain'"
            }
          ],
          "quickRecommendations": [
            {
              "recommendation": "Start with high-level impact before details",
              "example": "Begin presentations with '3 key takeaways' before diving into implementation details"
            }
          ]
        },
        "fireInTheBelly": [
        {
          "questionNumber": 1,
          "keyCompetencies": [
            "Passion-driven goal setting",
            "Unwavering commitment",
            "Resilience in adversity"
          ],
          "improvementAreas": [
            {
              "point": "Specific examples of persistence",
              "example": "Instead of 'remained committed,' specify: 'Continued working on the project despite facing three major obstacles'"
            }
          ],
          "quickRecommendations": [
            {
              "recommendation": "Include tangible evidence of perseverance",
              "example": "Add specific instances: 'Completed the project on time, working extra hours after multiple team members fell ill'"
            }
          ]
        }
    ],
"fireInTheBelly": [
        {
          "questionNumber": 2,
          "keyCompetencies": [
            "Goal-oriented focus",
            "Self-motivation",
            "Adaptability under pressure"
          ],
          "improvementAreas": [
            {
              "point": "Detailed documentation of effort",
              "example": "Instead of 'worked hard on the task,' specify: 'Developed and followed a meticulous plan to achieve the goal despite time constraints'"
            }
          ],
          "quickRecommendations": [
            {
              "recommendation": "Highlight specific challenges overcome",
              "example": "Include details: 'Successfully navigated tight deadlines and limited resources to deliver the project ahead of schedule'"
            }
          ]
        }
    ],

        {
          "questionNumber": 2,
          "keyCompetencies": [
            "Change management communication",
            "Training development",
            "Written documentation"
          ],
          "improvementAreas": [
            {
              "point": "Audience adaptation",
              "example": "Current: 'Sent technical specs to business team'. Better: 'Created role-specific guides for technical and business stakeholders'"
            }
          ],
          "quickRecommendations": [
            {
              "recommendation": "Develop role-based communication templates",
              "example": "Create separate documentation versions for developers, business analysts, and executives"
            }
          ]
        }
      ]
    }
  }
}

  "response": {
    "evaluationExamples": [
      {
        "scenario": "Technical Leadership Question",
        "question": "Describe a situation where you led a challenging technical project. What was your approach and what were the outcomes?",
        "irrelevantResponse for candidate": "I have good communication skills and always arrive at work on time. I also know Python and JavaScript.",
        "evaluation": {
          "innovationScore": 0,
          "communicationScore": 0.1,
        
            "detailedAnalysis": {
              "keyCompetencies":{
               "Irrelevant Response",
              }
            
            "improvementAreas": [
              {
                "point": "irrelevantResponse",
                "example": "Response fails to address project leadership, challenges faced, or specific outcomes. Instead focuses on general skills and punctuality.",
              }
            ],
            "recommendations": [
              {
                "point": "Focus on leadership experience",
                "example": "Describe a specific project, your leadership actions, and quantifiable results,dont give Irrelevant answers"
              }
            ]
          }
        }
      },
      {
        "scenario": "Problem-Solving Question",
        "question": "Tell us about a time when you identified and solved a critical system performance issue.",
        "irrelevantResponse for candidate": "I think team building is very important. Last month we had a great office party and everyone enjoyed it. The food was excellent.",
        "evaluation": {
          "innovationScore": 0,
          "communicationScore": 0,
          "detailedAnalysis": {
            "keyCompetencies": {
              "Completely Irrelevant",
              
              
            },
            "improvementAreas": [
              {
                "point": "Off-topic response",
                "example": "Response discusses social events instead of technical problem-solving. No connection to system performance or issue resolution.",
              }
            ],
            "recommendations": [
              {
                "point": "Use technical examples",
                "example": "Describe specific technical issues, your troubleshooting process, and measurable improvements, Here is an example how to approach: I identified that our customer database queries were taking 15+ seconds during peak hours. After analyzing query patterns and execution plans, I implemented database indexing and query optimization, reducing response time to under 200ms. This improved customer satisfaction scores by 30%.""
              }
            ]
          }
        }
      },
      {
        "scenario": "Innovation Question",
        "question": "Describe an innovative solution you implemented to improve efficiency in your previous role.",
        "irrelevantResponse for candidate": "I have 5 years of experience and worked at three different companies. My hobbies include reading and hiking.",
        "evaluation": {
          "innovationScore": 0,
          "communicationScore": 0,
          "detailedAnalysis": {
            "keyCompetencies": {
             "Irrelevant Response",
              
              
            },
            "improvementAreas": [
              {
                "point": "Missing innovation focus",
                "example": "Response lists work history and personal interests instead of addressing innovation or efficiency improvements."
              }
            ],
            "recommendations": [
              {
                "point": "Provide concrete innovation example",
                "example": "Detail an original solution, implementation process, and quantifiable impact,here is an example how to approach: I developed an automated testing framework using AI that reduced QA time by 60%. The innovation was combining ML for test case generation with automated execution, resulting in 90% test coverage and saving 20 hours per sprint."
              }
            ]
          }
        }
      }
    ],
  }

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
- First you should check whether the user response is relavent to the question or not if not give 0 for that question
take this example:
 * user might give dummy response for the question 1 and 2  which is 1st topic you should give zero scoring for first topic and give the feedback in the detailedAnalysis

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
- READ both question and header for the particular question and respond accordingly to the prompt mentioned in the heading
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
        "Not Recommended"
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
  
  Object.entries(rawData.responses).forEach(([category, questions]) => {
    Object.entries(questions).forEach(([index, item]) => {
      structuredData.push({
        category,
        questionNumber: Number(index) + 1,
        headers: item?.headers || "N/A",
        question: item?.question || "N/A",
        answer: item?.answer || "No response provided",
        responseTime: item?.responseTime || "N/A",
        timeTaken: item?.timeTaken || "N/A",
        pasteCount: item?.pasteCount || 0,
        tabSwitchCount: item?.tabSwitchCount || 0,
        unusualTypingCount: item?.unusualTypingCount || 0,
      });
    });
  });
  
  return structuredData;
};

export async function POST(req) {
  try {
    const body = await req.json();
    const recordId = body.recordId;
    if (!recordId) {
      throw new Error("Record ID is missing from the request body")  
    }
 
    const processedResponses = structureAssessmentData(body);
    
    const formattedPrompt =`Assessment Responses:\n` +
      processedResponses.map(response => `Category: ${response.category}\nHeader: ${response.headers}\nQuestion:${response.questionNumber}: ${response.question}\nAnswer: ${response.answer}\n`).join("\n");
      console.log("Formatted Prompt:", formattedPrompt);
    
    const { object: assessmentObject } = await generateObject({
      model: google("gemini-2.0-flash"), 
      prompt: formattedPrompt,
      system: systemPrompt,
      schema: schema,
      temperature: 0.3,
      preprocess: preprocessResponse
    });
    const calculateDeductions = () => {
      let deductions = 0;
      const { totalTabSwitchCount, totalUnusualTypingCount, totalPasteCount, timeOverruns } = body.behavioralData;
      
      if (totalTabSwitchCount > 2) {
        deductions += Math.min((totalTabSwitchCount - 2) * 0.1, 0.2);
      }
    
      // Deductions for unusual typing patterns
      if (totalUnusualTypingCount > 4) {
        deductions += Math.min((totalUnusualTypingCount - 4) * 0.05, 0.2);
      }
    
      // Deductions for copy/paste actions
      if (totalPasteCount > 3) {
        deductions += Math.min((totalPasteCount - 3) * 0.1, 0.3);
      }
    
      // Deductions for time overruns
      let timeOverrunCount = 0;
      Object.values(timeOverruns).forEach((section) => {
        Object.values(section).forEach((overrun) => {
          if (overrun) timeOverrunCount++;
        });
      });
      deductions += Math.min(timeOverrunCount * 0.3, 0.3);
    
      return Math.min(deductions, 1); // Cap deductions at 1.0
  };
  
  // Calculate deduction and round to 2 decimal places using Math.round
  let deductionPoints = calculateDeductions();
  deductionPoints = Math.round(deductionPoints * 100) / 100; // ✅ Rounding
  
  let overallscore = Math.max(0, assessmentObject.response.overallAssessment.overallscore - deductionPoints);
  overallscore = Math.round(overallscore * 100) / 100; // ✅ Rounding
  
  assessmentObject.response.overallAssessment.overallscore = overallscore;
  
  console.log("Deduction Points:", deductionPoints);
  console.log("Overall Score:", overallscore);
  assessmentObject.response.overallAssessment.overallscore = overallscore;
  
  const behavioralInsightsPrompt = `
  Analyze the following behavioral data and provide a detailed, structured analysis:

  Behavioral Metrics:
  - Unusual Typing Patterns: ${body.behavioralData.totalUnusualTypingCount}
  - Tab Switching: ${body.behavioralData.totalTabSwitchCount}
  - Copy/Paste Actions: ${body.behavioralData.totalPasteCount}
  - Time Overrun: ${body.behavioralData.timeOverrun}

  Please provide insights under the following categories:

  1. Time Efficiency Analysis:
     - Provide a rating of overall efficiency.
     - List specific observations related to time management.
     - Explain the impact of these behaviors on assessment quality.

  2. Response Patterns Analysis:
     - Identify consistent behavioral patterns.
     - Highlight any irregularities observed.
     - Note potential concerns, if any.

  3. Interaction Analysis:
     - Summarize the user's interaction style.
     - List key observed behaviors.
     - Provide actionable recommendations for improvement.

  **Formatting Guidelines:**
  - Ensure that section headers follow Title Case formatting (e.g., "Interaction Analysis" instead of "interactionAnalysis").
  - Maintain clarity and professionalism in the response and dont use not professional words like undefined .
  - Structure the analysis strictly according to the provided schema.
  Ignore the time-overrun if it was not observed in the given prompt.
`;

   console.log(behavioralInsightsPrompt)
    const { object: behavioralAnalysis } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: behavioralSchema,
      prompt: behavioralInsightsPrompt,
      temperature:0.3
    })

    
    
const base = new Airtable({apiKey:process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_ID);
const cleanedPayload = [];

// Keep track of the overall question index across all topics
let globalQuestionIndex = 0;

Object.entries(body.responses).forEach(([topic, questions]) => {
  // Convert questions object/array to array of entries for processing
  Object.values(questions).forEach((item) => {
    // Combine all detailed analysis reports into a single array
    const allReports = [
      ...assessmentObject.response.detailedAnalysis.innovation.map(report => ({
        ...report,
        
      })),
      ...assessmentObject.response.detailedAnalysis.communication.map(report => ({
        ...report,
        
      })),
      ...assessmentObject.response.detailedAnalysis.fireInBelly.map(report => ({
        ...report,
        
      }))
    ];

    // Sort all reports by question number
    const sortedReports = allReports.sort((a, b) => a.questionNumber - b.questionNumber);

    // Get the corresponding report for this question using the global index
    const report = sortedReports[globalQuestionIndex] || {};

    // Add the item to the array with the specified structure
    cleanedPayload.push({
      topic: topic,
      headers: item.headers,
      question: item.question,
      response: item.answer,
      report: report
    });

    // Increment the global question counter
    globalQuestionIndex++;
  });
});


console.log("scores: ",assessmentObject.response.overallAssessment)
console.log("Cleaned Payload:", JSON.stringify(cleanedPayload));
await new Promise((resolve, reject) => {
  base("Candidate").update(
    recordId,
    {
      "status": "completed",
      "overallScore":  assessmentObject.response.overallAssessment.overallscore,
      "innovationScore": assessmentObject.response.overallAssessment.innovationScore,
      "fireInBellyScore": assessmentObject.response.overallAssessment.fireInBellyScore,
      "communicationScore": assessmentObject.response.overallAssessment.communicationScore,
      "deductionPoints": deductionPoints,
      "summary": assessmentObject.response.recruitmentSummary.summary,
      "recommendation": assessmentObject.response.recruitmentSummary.recommendation,
      "detailedAnalysis": JSON.stringify(cleanedPayload),
      "behavioralAnalysis": JSON.stringify(behavioralAnalysis.behavioralAnalysis),
      
    },
    (err, record) => {
      if (err) {
        console.error("Error updating candidate:", err)
        reject(err)
      } else {
        console.log("Candidate updated successfully")
        resolve()
      }
    },
  )
})

return NextResponse.json({ status: "success", message: "Assessment processed successfully" })
} catch (error) {
console.error("Error during assessment processing:", error)
return NextResponse.json(
  { error: error.message || "Failed to process the assessment. Please try again." },
  { status: 500 },
)
}
}

