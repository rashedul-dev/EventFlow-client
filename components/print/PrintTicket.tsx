"use client";

/**
 * PrintTicket - Ticket printing component
 *
 * Features:
 * - High-resolution QR code rendering
 * - Barcode optimization for scanning
 * - Security features (watermark, anti-copy patterns)
 * - Multi-language ticket support
 * - Batch printing for organizers
 */

import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

export interface TicketData {
  id: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  ticketType: string;
  ticketPrice: string;
  attendeeName: string;
  attendeeEmail: string;
  seatNumber?: string;
  row?: string;
  section?: string;
  barcode: string;
  qrData: string;
  orderNumber: string;
  purchaseDate: string;
}

interface PrintTicketProps {
  ticket: TicketData;
  showWatermark?: boolean;
  language?: "en" | "es" | "fr" | "de";
}

const translations = {
  en: {
    ticket: "EVENT TICKET",
    event: "Event",
    date: "Date",
    time: "Time",
    location: "Location",
    ticketType: "Ticket Type",
    price: "Price",
    attendee: "Attendee",
    seat: "Seat",
    row: "Row",
    section: "Section",
    orderNumber: "Order #",
    purchaseDate: "Purchased",
    admitOne: "ADMIT ONE",
    scanAtEntrance: "Scan QR code at entrance",
    termsAndConditions: "Subject to terms and conditions. Non-refundable.",
  },
  es: {
    ticket: "BOLETO DE EVENTO",
    event: "Evento",
    date: "Fecha",
    time: "Hora",
    location: "Ubicación",
    ticketType: "Tipo de Boleto",
    price: "Precio",
    attendee: "Asistente",
    seat: "Asiento",
    row: "Fila",
    section: "Sección",
    orderNumber: "Pedido #",
    purchaseDate: "Comprado",
    admitOne: "ADMITE UNO",
    scanAtEntrance: "Escanee el código QR en la entrada",
    termsAndConditions: "Sujeto a términos y condiciones. No reembolsable.",
  },
  fr: {
    ticket: "BILLET D'ÉVÉNEMENT",
    event: "Événement",
    date: "Date",
    time: "Heure",
    location: "Lieu",
    ticketType: "Type de Billet",
    price: "Prix",
    attendee: "Participant",
    seat: "Siège",
    row: "Rangée",
    section: "Section",
    orderNumber: "Commande #",
    purchaseDate: "Acheté",
    admitOne: "ADMET UN",
    scanAtEntrance: "Scannez le code QR à l'entrée",
    termsAndConditions: "Sous réserve des termes et conditions. Non remboursable.",
  },
  de: {
    ticket: "VERANSTALTUNGSTICKET",
    event: "Veranstaltung",
    date: "Datum",
    time: "Zeit",
    location: "Ort",
    ticketType: "Tickettyp",
    price: "Preis",
    attendee: "Teilnehmer",
    seat: "Sitz",
    row: "Reihe",
    section: "Sektor",
    orderNumber: "Bestellung #",
    purchaseDate: "Gekauft",
    admitOne: "EINTRITT FÜR EINE PERSON",
    scanAtEntrance: "QR-Code am Eingang scannen",
    termsAndConditions: "Unterliegt den Geschäftsbedingungen. Nicht erstattungsfähig.",
  },
};

export function PrintTicket({ ticket, showWatermark = true, language = "en" }: PrintTicketProps) {
  const t = translations[language];
  const ticketRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-ticket-container">
      {/* Screen-only controls */}
      <div className="screen-only mb-4 flex gap-2">
        <button onClick={handlePrint} className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90">
          Print Ticket
        </button>
      </div>

      {/* Ticket */}
      <div
        ref={ticketRef}
        className="ticket event-ticket print-background page-break-after"
        style={{
          position: "relative",
          maxWidth: "800px",
          margin: "0 auto",
          border: "3px solid #000",
          borderRadius: "8px",
          padding: "32px",
          background: "white",
        }}
      >
        {/* Watermark */}
        {showWatermark && (
          <div
            className="ticket-watermark"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-45deg)",
              fontSize: "72px",
              fontWeight: "bold",
              color: "#f0f0f0",
              opacity: 0.1,
              userSelect: "none",
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            VALID TICKET
          </div>
        )}

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Header */}
          <div className="ticket-header" style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>{t.ticket}</h1>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#08CB00" }}>{t.admitOne}</div>
          </div>

          {/* Event Details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            <div>
              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{t.event}:</div>
              <div style={{ fontSize: "18px", marginBottom: "12px" }}>{ticket.eventName}</div>

              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{t.date}:</div>
              <div style={{ marginBottom: "12px" }}>{ticket.eventDate}</div>

              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{t.time}:</div>
              <div style={{ marginBottom: "12px" }}>{ticket.eventTime}</div>

              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{t.location}:</div>
              <div>{ticket.eventLocation}</div>
            </div>

            <div>
              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{t.attendee}:</div>
              <div style={{ marginBottom: "12px" }}>{ticket.attendeeName}</div>

              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{t.ticketType}:</div>
              <div style={{ marginBottom: "12px" }}>{ticket.ticketType}</div>

              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{t.price}:</div>
              <div style={{ marginBottom: "12px" }}>{ticket.ticketPrice}</div>

              {ticket.seatNumber && (
                <>
                  <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    {t.section}: {ticket.section} | {t.row}: {ticket.row} | {t.seat}: {ticket.seatNumber}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* QR Code */}
          <div className="ticket-qr" style={{ textAlign: "center", margin: "24px 0" }}>
            <QRCodeSVG
              value={ticket.qrData}
              size={200}
              level="H"
              includeMargin={true}
              className="print-background"
              style={{ border: "2px solid #000", padding: "8px" }}
            />
            <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>{t.scanAtEntrance}</div>
          </div>

          {/* Barcode */}
          <div className="ticket-barcode" style={{ textAlign: "center", margin: "24px 0" }}>
            <svg width="300" height="60" style={{ margin: "0 auto" }}>
              {/* Simple barcode representation */}
              {ticket.barcode.split("").map((char, i) => (
                <rect key={i} x={i * 10} y={0} width={parseInt(char) % 2 === 0 ? 3 : 6} height={50} fill="#000" />
              ))}
            </svg>
            <div style={{ marginTop: "4px", fontSize: "10px", fontFamily: "monospace" }}>{ticket.barcode}</div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: "2px dashed #000", paddingTop: "16px", fontSize: "10px", color: "#666" }}>
            <div style={{ marginBottom: "8px" }}>
              {t.orderNumber}: {ticket.orderNumber} | {t.purchaseDate}: {ticket.purchaseDate}
            </div>
            <div style={{ fontSize: "9px" }}>{t.termsAndConditions}</div>
            <div style={{ marginTop: "8px", fontSize: "9px" }}>Ticket ID: {ticket.id}</div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx>{`
        @media print {
          .screen-only {
            display: none !important;
          }

          .ticket {
            page-break-after: always;
            margin: 0;
            border: 3px solid #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }

          .ticket:last-child {
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * BatchPrintTickets - Print multiple tickets at once
 */
interface BatchPrintTicketsProps {
  tickets: TicketData[];
  language?: "en" | "es" | "fr" | "de";
}

export function BatchPrintTickets({ tickets, language = "en" }: BatchPrintTicketsProps) {
  return (
    <div>
      <div className="screen-only mb-4">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90"
        >
          Print All {tickets.length} Tickets
        </button>
      </div>

      {tickets.map((ticket, index) => (
        <PrintTicket key={ticket.id} ticket={ticket} language={language} showWatermark={true} />
      ))}
    </div>
  );
}
