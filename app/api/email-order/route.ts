import { NextRequest, NextResponse } from "next/server"


export async function POST(req: NextRequest) {
  try {
    const order = await req.json()

    // Compose email content with all cart info
    const itemsHtml = order.items.map((item: any) =>
      `<li style="margin-bottom:8px;">
        <b>${item.quantity} x ${item.name}</b><br/>
        Size: ${item.size}, Color: ${item.color}, Price: $${item.price}
        ${item.image_url ? `<br/><img src="${item.image_url}" alt="${item.name}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;" />` : ""}
      </li>`
    ).join("")

    const html = `
      <h2>New Order Received</h2>
      <p><b>Name:</b> ${order.customer_name}</p>
      <p><b>Email:</b> ${order.customer_email}</p>
      <p><b>Phone:</b> ${order.customer_phone || "-"}</p>
      <p><b>Address:</b> ${order.shipping_address}</p>
      <h3>Order Items:</h3>
      <ul>${itemsHtml}</ul>
      <p><b>Promo Code:</b> ${order.promo_code || "-"}</p>
      <p><b>Total:</b> $${order.total_amount || "-"}</p>
    `


    // Send email using Brevo API
    const brevoApiKey = process.env.BREVO_API_KEY
    if (!brevoApiKey) {
      throw new Error("Missing BREVO_API_KEY in environment variables")
    }

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
  sender: { name: "Kicks Life", email: "cbenit11@gmail.com" },
        to: [{ email: "cbenit11@gmail.com", name: "Admin" }],
        subject: "New Order Received",
        htmlContent: html,
      }),
    })

    if (!brevoRes.ok) {
      const errText = await brevoRes.text()
      throw new Error(`Brevo API error: ${errText}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Order Email] Error:", error)
    return NextResponse.json({ error: "Failed to send order email" }, { status: 500 })
  }
}
