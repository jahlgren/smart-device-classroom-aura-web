import db from "@/db";
import { device } from "@/db/schema/device";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = await db
      .delete(device)
      .where(eq(device.id, id))
      .returning({ id: device.id });
    
    if (deleted.length === 0) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    return NextResponse.json({ id: deleted[0].id, status: "deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } 
} 