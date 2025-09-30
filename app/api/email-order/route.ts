import { NextRequest, NextResponse } from "next/server"


export async function POST(req: NextRequest) {
  try {
    const order = await req.json()

    // Compose email content with all cart info
    const itemsHtml = order.items.map((item: any) =>
      `<li style="margin-bottom:8px;">
        <b>${item.quantity} x ${item.name}</b><br/>
        Size: ${item.size}, Color: ${item.color}, Price: $${item.price}
      </li>`
    ).join("")

    const html = `
      <h2>New Order Received</h2>
      <p><b>Name:</b> ${order.customer_name}</p>
      <p><b>Email:</b> ${order.customer_email}</p>
      <p><b>Phone:</b> ${order.customer_phone || "-"}</p>
      <p><b>Address:</b> ${order.shipping_address}</p>
      <p><b>Promo Code:</b> ${order.promo_code || "-"}</p>
      <p><b>Discount:</b> $${order.discount_amount !== undefined ? order.discount_amount : 0}</p>
      <p><b>Total:</b> $${order.total_amount || "-"}</p>
      <h3>Order Items:</h3>
      <ul>${itemsHtml}</ul>
    `


    // Send order data to Google Apps Script Web App (spreadsheet)
  const webAppUrl = "https://script.google.com/macros/s/AKfycby-lM2hIjGOkS_MuKf8gzyxWByNEf486ixhe3qkx3D5_ujg-IuwXyRjxn22atsdJ7hfNw/exec"
    const sheetRes = await fetch(webAppUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        address: order.shipping_address,
        promoCode: order.promo_code || "-",
        discount: order.discount_amount !== undefined ? order.discount_amount : 0,
        total: order.total_amount || 0,
        orderItems: Array.isArray(order.items)
          ? order.items.map((item: any) => `${item.quantity}x ${item.name} (Size: ${item.size}, Color: ${item.color}, $${item.price})`).join("; ")
          : "",
      }),
    })

    if (!sheetRes.ok) {
      const errText = await sheetRes.text()
      throw new Error(`Spreadsheet API error: ${errText}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Order Email] Error:", error)
    return NextResponse.json({ error: "Failed to send order email" }, { status: 500 })
  }
}
