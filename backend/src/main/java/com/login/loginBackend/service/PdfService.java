package com.login.loginBackend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.login.loginBackend.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class PdfService {

    private static final Logger logger = LoggerFactory.getLogger(PdfService.class);

    public ByteArrayInputStream generateStatement(List<Transaction> transactions, String username) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Document Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("VaultCore Bank - Account Statement", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            // Customer Details
            document.add(new Paragraph("Customer: " + username + "\n\n"));

            // Table Construction
            PdfPTable table = new PdfPTable(3);
            table.setWidthPercentage(100);
            
            // Table Headers
            table.addCell("Date");
            table.addCell("Status");
            table.addCell("Amount");

            // Populate Table with Transaction Data
            for (Transaction transaction : transactions) {
                // Ensure timestamp is safely converted to string
                String dateStr = transaction.getTimestamp().toString();
                // Taking first 10 chars (YYYY-MM-DD) if available
                table.addCell(dateStr.length() >= 10 ? dateStr.substring(0, 10) : dateStr);
                
                table.addCell(transaction.getStatus());
                table.addCell("Rs. " + transaction.getAmount());
            }

            document.add(table);
            document.close();

        } catch (DocumentException e) {
            logger.error("Error occurred while generating PDF statement", e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}