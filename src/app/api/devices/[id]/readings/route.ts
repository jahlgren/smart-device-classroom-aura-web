import db from "@/db";
import { Reading, reading } from "@/db/schema/reading";
import { CreateReadingSchema } from "@/form-schemas/create-reading-schema";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const devices = await db
      .select()
      .from(reading)
      .where(eq(reading.deviceId, id))
      .orderBy(asc(reading.createdAt));

    return NextResponse.json<Reading[]>(devices);
  } catch (err) {
    console.error("Error fetching readings: ", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Validate input.
  const body = await request.json();
  const parsed = CreateReadingSchema.safeParse(body);
  if(!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 422 }
    );
  }
  const data = parsed.data;

  try {  
    const { id } = await params;

    const result = await db
      .insert(reading)
      .values({
        deviceId: id,
        readingType: data.type,
        value: data.value
      })
      .returning();

      return NextResponse.json<Reading[]>(result, { status: 201 });
  } catch (error) {
    console.error("Error creating device: ", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
