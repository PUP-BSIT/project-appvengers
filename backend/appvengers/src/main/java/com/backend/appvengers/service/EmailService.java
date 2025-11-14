package com.backend.appvengers.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

  private final JavaMailSender emailSender;

  public void sendSimpleEmail(String to, String subject, String text) {
    SimpleMailMessage message = new SimpleMailMessage();
  
    message.setTo(to);
    message.setSubject(subject);
    message.setText(text);

    emailSender.send(message);
  }

  public void sendHtmlEmail(String from, String to, String subject, String verificationLink, String username) throws MessagingException, IOException {
    MimeMessage message = emailSender.createMimeMessage();

    message.setFrom(new InternetAddress(from));
    message.setRecipients(MimeMessage.RecipientType.TO, to);
    message.setSubject(subject);

    String htmlTemplate = readFile("src/main/resources/template.html");
    String htmlContent = htmlTemplate.replace("${name}", username)
                                     .replace("${verificationLink}", verificationLink);

    message.setContent(htmlContent, "text/html; charset=utf-8");

    emailSender.send(message);
  }

  // Read the path to template.html and send as email content
  public String readFile(String filePath) throws IOException {
    Path path = Paths.get(filePath);
    return Files.readString(path, StandardCharsets.UTF_8);
  }
}
