import { type NextRequest, NextResponse } from "next/server"

export function authMiddleware(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const authHeader = req.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const token = authHeader.split(" ")[1]

    // TODO: Implement proper token validation
    if (token !== process.env.API_SECRET_KEY) {
      return new NextResponse(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    return handler(req)
  }
}

