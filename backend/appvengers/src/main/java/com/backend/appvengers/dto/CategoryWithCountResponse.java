package com.backend.appvengers.dto;

public class CategoryWithCountResponse {
    private Integer id;
    private Integer userId;
    private String name;
    private String type;
    private Integer referencesCount;

    public CategoryWithCountResponse() {}

    public CategoryWithCountResponse(
        Integer id, 
        Integer userId, 
        String name, 
        String type, 
        Integer referencesCount
    ) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.type = type;
        this.referencesCount = referencesCount;
    }

    // Getters and setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getReferencesCount() { return referencesCount; }
    
    public void setReferencesCount(Integer referencesCount) { 
        this.referencesCount = referencesCount; 
    }
}