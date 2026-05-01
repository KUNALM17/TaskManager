package com.example.demo.payload.response;

import com.example.demo.entity.ChecklistItem;

public record ChecklistItemResponse(Long id, String title, boolean completed) {
    public static ChecklistItemResponse from(ChecklistItem item) {
        return new ChecklistItemResponse(item.getId(), item.getTitle(), item.isCompleted());
    }
}
