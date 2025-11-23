package com.backend.appvengers.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

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

    String htmlTemplate = readFileFromClasspath("template.html");
    String htmlContent = htmlTemplate.replace("${name}", username)
                                     .replace("${verificationLink}", verificationLink);

    message.setContent(htmlContent, "text/html; charset=utf-8");

    emailSender.send(message);
  }

  public void sendPasswordResetEmail(String from, String to, String username, String resetLink) throws MessagingException, IOException {
    MimeMessage message = emailSender.createMimeMessage();

    message.setFrom(new InternetAddress(from));
    message.setRecipients(MimeMessage.RecipientType.TO, to);
    message.setSubject("Reset Your iBudget Password");

    String htmlTemplate = readFileFromClasspath("password-reset-template.html");
    String htmlContent = htmlTemplate.replace("${name}", username)
                                     .replace("${resetLink}", resetLink);

    message.setContent(htmlContent, "text/html; charset=utf-8");

    emailSender.send(message);
  }

  // Read the template.html from classpath (works in both dev and production JAR)
  public String readFileFromClasspath(String fileName) throws IOException {
    try (var inputStream = getClass().getClassLoader().getResourceAsStream(fileName)) {
      if (inputStream == null) {
        throw new IOException("Template file not found: " + fileName);
      }
      return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
    }
  }
}
