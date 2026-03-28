import { parseLRC } from "@/utils";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
    const filePath = path.join(process.cwd(), "public", "Boney M Rasputin Lyrics.lrc");
    const content = fs.readFileSync(filePath, "utf-8");

    return NextResponse.json({
        message: "success",
        data: parseLRC(content),
        status: 200
    });
}