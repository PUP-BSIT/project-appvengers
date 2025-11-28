package com.backend.appvengers.dto;
import java.util.List;

public class IncomeSummary {
    private List<String> labels;
    private List<Double> values;

    public IncomeSummary(List<String> labels, List<Double> values) {
        this.labels = labels;
        this.values = values;
    }

    public List<String> getLabels() {
        return labels;
    }

    public List<Double> getValues() {
        return values;
    }
}