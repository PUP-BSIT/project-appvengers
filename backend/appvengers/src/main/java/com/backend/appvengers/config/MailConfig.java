package com.backend.appvengers.config;

import java.util.Properties;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class MailConfig {

  private final Environment env;

  @Bean
  public JavaMailSender javaMailSender() {
    JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
    mailSender.setHost(env.getProperty("spring.mail.host","smtp.gmail.com"));
    mailSender.setPort(Integer.parseInt(env.getProperty("spring.mail.port", "587")));
    mailSender.setUsername(env.getProperty("spring.mail.username"));
    mailSender.setPassword(env.getProperty("spring.mail.password"));

    Properties properties = mailSender.getJavaMailProperties();
    properties.put("mail.transport.protocol", "smtp");
    properties.put("mail.smtp.auth", "true");
    properties.put("mail.smtp.starttls.enable", "true");
    return mailSender;
  }
}
