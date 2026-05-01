package com.example.demo.payload.response;

import com.example.demo.entity.Attachment;

public record AttachmentResponse(
        Long id,
        String name,
        String url
) {
    public static AttachmentResponse from(Attachment attachment) {
        return new AttachmentResponse(
                attachment.getId(),
                attachment.getName(),
                attachment.getUrl()
        );
    }
}
