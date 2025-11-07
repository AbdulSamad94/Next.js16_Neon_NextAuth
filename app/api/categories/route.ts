import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/schema";
import slugify from "slugify";

export async function GET() {
    try {
        const allCategories = await db.query.categories.findMany({
            orderBy: (categories, { asc }) => [asc(categories.name)],
        });

        return NextResponse.json({
            success: true,
            categories: allCategories,
        });
    } catch (error) {
        console.error("Fetch categories error:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const slug = slugify(body.name, { lower: true, strict: true });

        const [newCategory] = await db
            .insert(categories)
            .values({
                name: body.name,
                slug,
                description: body.description || null,
            })
            .returning();

        return NextResponse.json({
            success: true,
            category: newCategory,
        });
    } catch (error) {
        console.error("Create category error:", error);
        return NextResponse.json(
            { error: "Failed to create category" },
            { status: 500 }
        );
    }
}