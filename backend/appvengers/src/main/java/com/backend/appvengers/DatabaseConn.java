package com.backend.appvengers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import javax.sql.DataSource;
import java.sql.Connection;

@SpringBootApplication
public class DatabaseConn implements CommandLineRunner{

    @Autowired
    private DataSource dataSource;

    public static void main(String[] args) {
        SpringApplication.run(DatabaseConn.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            System.out.println("✅ Connected to Hostinger MySQL!");
            System.out.println("🔗 URL: " + conn.getMetaData().getURL());
            System.out.println("🧠 DB Product: " + conn.getMetaData().getDatabaseProductName());
        }
    }
} 
