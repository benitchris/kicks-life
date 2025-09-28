import { NextRequest, NextResponse } from "next/server"
import { join } from "path"
import { writeFile } from "fs/promises"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get("file") as File
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "")}`
  const filePath = join(process.cwd(), "public", fileName)
  await writeFile(filePath, buffer)
  const url = `/` + fileName
  return NextResponse.json({ url })
}
