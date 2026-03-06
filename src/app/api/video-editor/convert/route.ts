import { NextRequest, NextResponse } from "next/server";
import { exec }    from "child_process";
import { writeFile, unlink, readFile } from "fs/promises";
import { tmpdir }  from "os";
import { join }    from "path";
import { promisify } from "util";

export const maxDuration = 300; // 5 min — enough for 4K encode

const execAsync = promisify(exec);

const FFMPEG = process.env.FFMPEG_PATH ?? "ffmpeg";

export async function POST(req: NextRequest) {
  let inputPath  = "";
  let outputPath = "";

  try {
    const form   = await req.formData();
    const file   = form.get("file")   as File   | null;
    const width  = parseInt((form.get("width")  as string) ?? "1920");
    const height = parseInt((form.get("height") as string) ?? "1080");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const id   = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    inputPath  = join(tmpdir(), `ve-in-${id}.webm`);
    outputPath = join(tmpdir(), `ve-out-${id}.mp4`);

    // Write uploaded WebM to disk
    const bytes = await file.arrayBuffer();
    await writeFile(inputPath, Buffer.from(bytes));

    // Quality settings: better CRF for larger outputs
    const crf    = width >= 3840 ? "20" : width >= 1920 ? "22" : "23";
    const preset = width >= 3840 ? "medium" : "fast";
    const audioBr = "128k";

    // Scale to exact target dimensions, letterbox/pillarbox with black bars
    const scaleFilter = [
      `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
      `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black`,
      `setsar=1`,
    ].join(",");

    const cmd = [
      FFMPEG,
      `-y`,
      `-i "${inputPath}"`,
      `-vf "${scaleFilter}"`,
      `-c:v libx264`,
      `-crf ${crf}`,
      `-preset ${preset}`,
      `-movflags +faststart`,   // streaming-friendly (plays immediately on upload)
      `-c:a aac`,
      `-b:a ${audioBr}`,
      `-ar 44100`,
      `"${outputPath}"`,
    ].join(" ");

    await execAsync(cmd);

    const mp4 = await readFile(outputPath);

    return new NextResponse(mp4, {
      status: 200,
      headers: {
        "Content-Type":        "video/mp4",
        "Content-Disposition": `attachment; filename="neat-curb-${width}x${height}.mp4"`,
        "Content-Length":      mp4.byteLength.toString(),
      },
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[video-editor/convert]", msg);
    return NextResponse.json({ error: "Conversion failed.", detail: msg }, { status: 500 });

  } finally {
    if (inputPath)  await unlink(inputPath).catch(() => {});
    if (outputPath) await unlink(outputPath).catch(() => {});
  }
}
