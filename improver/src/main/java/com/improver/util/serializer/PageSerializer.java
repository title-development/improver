package com.improver.util.serializer;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import org.springframework.boot.jackson.JsonComponent;
import org.springframework.data.domain.PageImpl;

import java.io.IOException;

@JsonComponent
public class PageSerializer extends JsonSerializer<PageImpl> {
    @Override
    public void serialize(PageImpl value, JsonGenerator gen, SerializerProvider provider) throws IOException {
        gen.writeStartObject();
        gen.writeNumberField("number", value.getNumber());
        gen.writeNumberField("numberOfElements", value.getNumberOfElements());
        gen.writeNumberField("totalElements", value.getTotalElements());
        gen.writeNumberField("totalPages", value.getTotalPages());
        gen.writeNumberField("size", value.getSize());
        gen.writeBooleanField("first", value.isFirst());
        gen.writeBooleanField("last", value.isLast());
        gen.writeFieldName("content");
        provider.defaultSerializeValue(value.getContent(), gen);
        gen.writeEndObject();
    }
}
