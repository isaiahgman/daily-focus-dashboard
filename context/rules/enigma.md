# Enigma Cipher Machine: Cryptographic Mechanics

This document provides agents with the domain-specific constraints for the Enigma module (`src/modules/enigma/`). **Agents MUST read this before modifying any enigma logic.**

## Overview
The module emulates a WWII-era Enigma machine implementing symmetric rotor-based encryption. Encrypting ciphertext with the same settings produces the original plaintext (symmetry via the reflector).

## Rotor Mechanics

### Available Rotors
Three historical rotors are implemented, each with unique wiring and a notch position:
- **Rotor I:** Notch at `Q`
- **Rotor II:** Notch at `E`  
- **Rotor III:** Notch at `V`

### Stepping Mechanism
Rotors step **before** each letter is encrypted (not after). The stepping order is:
1. The **right rotor** always steps.
2. If the **right rotor** is at its notch position, the **middle rotor** also steps.
3. **Double-stepping anomaly:** If the **middle rotor** is at its notch position, both the **middle** and **left** rotors step. This is a historically accurate behavior that agents must preserve.

### Signal Path
For each character, the electrical signal travels through the machine in this exact order:
1. **Plugboard** (swap pairs)
2. **Right rotor** (forward pass)
3. **Middle rotor** (forward pass)
4. **Left rotor** (forward pass)
5. **Reflector** (bounce)
6. **Left rotor** (backward pass)
7. **Middle rotor** (backward pass)
8. **Right rotor** (backward pass)
9. **Plugboard** (swap pairs again)

### Forward vs Backward Pass
- **Forward:** `(code + position) % 26` maps through the wiring table, then subtracts position.
- **Backward:** Finds the index in the wiring table that maps to the target contact, then subtracts position.
- Both use modular arithmetic (`mod 26`) to wrap around the alphabet.

## Reflectors
Two reflectors are available: **B** and **C**. The reflector ensures no letter encrypts to itself (a known Enigma weakness agents should be aware of but must preserve for historical accuracy).

## Plugboard
- Configured as space-separated letter pairs (e.g., `"AB CD EF"`).
- Each letter may appear in at most one pair.
- A letter cannot be paired with itself.
- Validation errors are thrown for invalid configurations.

## Critical Constraints
- **Non-alphabetic characters pass through unchanged.** Do not encrypt spaces, numbers, or punctuation.
- **Case is preserved.** Lowercase input produces lowercase output.
- **Symmetry must be maintained.** Encrypting the ciphertext with the same initial settings MUST reproduce the plaintext. Any change that breaks this has fundamentally broken the machine.
