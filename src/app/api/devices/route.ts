import db from "@/db";
import { Device, device } from "@/db/schema/device";
import { CreateDeviceSchema } from "@/form-schemas/create-device-schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const devices = await db
      .select()
      .from(device)
      .orderBy(desc(device.createdAt));

    return NextResponse.json<Device[]>(devices);
  } catch (err) {
    console.error("Error fetching devices: ", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Validate input.
  const body = await request.json();
  const parsed = CreateDeviceSchema.safeParse(body);
  if(!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 422 }
    );
  }
  const data = parsed.data;

  try {  
    const result = await db
      .insert(device)
      .values({
        id: data.id,
        description: data.description
      })
      .returning();

      return NextResponse.json<Device>(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating device: ", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}