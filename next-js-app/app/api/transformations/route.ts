// api route that appends transformations to the organization firestore

import { NextRequest, NextResponse } from "next/server";
import { adminOrganizationDB } from "@/auth/firebaseAdmin";
import { Transformation } from "@/types/Transformation";
import getUrlSearchParameter from "@/utils/getUrlSearchParameter";

async function POST(req: NextRequest) {
  const { organization, transformation } = await req.json();

  if (!organization) {
    return NextResponse.json({ message: "No organization" }, { status: 500 });
  }

  try {
    const docRef = adminOrganizationDB
      .collection("organizations")
      .doc(organization);

    const currentTransformations = await docRef.get().then((doc) => {
      if (doc.exists) {
        return doc.data()?.transformations;
      }
    });

    if (!currentTransformations) {
      await docRef.set({ transformations: [transformation] });
      return NextResponse.json(
        { message: "Transformation added successfully" },
        { status: 200 }
      );
    }
    await docRef.update({
      transformations: [...currentTransformations, transformation],
    });

    return NextResponse.json(
      { message: "Transformation added successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding transformation: ", error);
    return NextResponse.json(
      { message: "Error adding transformation" },
      { status: 500 }
    );
  }
}

async function GET(req: NextRequest) {
  const organization = getUrlSearchParameter(
    req.nextUrl.searchParams,
    "organization"
  );

  const transformation = getUrlSearchParameter(
    req.nextUrl.searchParams,
    "transformation"
  );

  if (!organization) {
    return NextResponse.json({ message: "No organization" }, { status: 500 });
  }

  if (transformation) {
    try {
      const docRef = adminOrganizationDB
        .collection("organizations")
        .doc(organization);

      const transformations = await docRef.get().then((doc) => {
        if (doc.exists) {
          return doc.data().transformations;
        }
      });

      const transformationData = transformations.find(
        (t) => t.name.toLowerCase() === transformation.toLowerCase()
      );

      if (transformationData) {
        return NextResponse.json(transformationData, { status: 200 });
      } else {
        return NextResponse.json(
          { message: "Transformation not found" },
          { status: 404 }
        );
      }
    } catch (error) {
      console.error("Error adding transformation: ", error);
      return NextResponse.json(
        { message: "Error adding transformation" },
        { status: 500 }
      );
    }
  }

  try {
    const docRef = adminOrganizationDB
      .collection("organizations")
      .doc(organization);

    const transformations = await docRef.get().then((doc) => {
      if (doc.exists) {
        return doc.data().transformations;
      }
    });

    return NextResponse.json(transformations, { status: 200 });
  } catch (error) {
    console.error("Error adding transformation: ", error);
    return NextResponse.json(
      { message: "Error adding transformation" },
      { status: 500 }
    );
  }
}

async function DELETE(req: NextRequest) {
  const {
    organization,
    transformation,
  }: { organization: string; transformation: Transformation } =
    await req.json();

  if (!organization) {
    return NextResponse.json({ message: "No organization" }, { status: 500 });
  }

  try {
    const docRef = adminOrganizationDB
      .collection("organizations")
      .doc(organization);

    const currentTransformations = await docRef.get().then((doc) => {
      if (doc.exists) {
        return doc.data().transformations;
      }
    });

    const updatedTransformations = currentTransformations.filter(
      (t) => t.name !== transformation.name
    );

    await docRef.update({
      transformations: updatedTransformations,
    });

    if (transformation.type === "lookup") {
      const deleted = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/mssql-mappings`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            organization: organization,
            transformation: transformation.name,
          }),
        }
      );
      if (deleted.status !== 200) {
        return NextResponse.json(
          { message: "Error deleting transformation" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { message: "Transformation deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting transformation: ", error);
    return NextResponse.json(
      { message: "Error deleting transformation" },
      { status: 500 }
    );
  }
}

export { POST, GET, DELETE };
