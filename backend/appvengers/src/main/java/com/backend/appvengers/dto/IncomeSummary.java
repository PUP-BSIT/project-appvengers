package com.backend.appvengers.dto;

import java.util.List;

public record IncomeSummary(List<String> labels, List<Double> values) {}