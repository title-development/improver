package com.improver.enums;

public enum Priority {
    LOWEST(1),
    LOW(2),
    MEDIUM(3),
    HIGH(4),
    CRITICAL(5);

    private final int value;

    Priority (int value) {
        this.value = value;
    }

    public boolean equalsValue(int value) {
        return this.value == value;
    }

    @Override
    public String toString() {
        return Integer.toString(this.value);
    }

}
