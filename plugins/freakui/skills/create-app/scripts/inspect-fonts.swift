#!/usr/bin/env -S xcrun swift

import CoreText
import CryptoKit
import Foundation

struct FontDescriptor: Encodable {
    let familyName: String?
    let postScriptName: String?
    let styleName: String?
}

struct InspectedFont: Encodable {
    let fileName: String
    let path: String
    let sha256: String
    let descriptors: [FontDescriptor]
}

func stringAttribute(_ descriptor: CTFontDescriptor, _ key: CFString) -> String? {
    CTFontDescriptorCopyAttribute(descriptor, key) as? String
}

func inspect(_ rawPath: String) throws -> InspectedFont {
    let url = URL(fileURLWithPath: rawPath).standardizedFileURL
    let values = try url.resourceValues(forKeys: [.isRegularFileKey])
    guard values.isRegularFile == true else {
        throw NSError(
            domain: "FreakUIFontInspector",
            code: 1,
            userInfo: [NSLocalizedDescriptionKey: "Not a regular file: \(url.path)"]
        )
    }
    let fileExtension = url.pathExtension.lowercased()
    guard fileExtension == "otf" || fileExtension == "ttf" else {
        throw NSError(
            domain: "FreakUIFontInspector",
            code: 2,
            userInfo: [NSLocalizedDescriptionKey: "Expected a .otf or .ttf file: \(url.path)"]
        )
    }

    let data = try Data(contentsOf: url, options: [.mappedIfSafe])
    let checksum = SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined()
    let coreTextDescriptors = CTFontManagerCreateFontDescriptorsFromURL(url as CFURL) as? [CTFontDescriptor] ?? []
    guard !coreTextDescriptors.isEmpty else {
        throw NSError(
            domain: "FreakUIFontInspector",
            code: 3,
            userInfo: [NSLocalizedDescriptionKey: "Core Text could not read font metadata: \(url.path)"]
        )
    }

    let descriptors = coreTextDescriptors.map { descriptor in
        FontDescriptor(
            familyName: stringAttribute(descriptor, kCTFontFamilyNameAttribute),
            postScriptName: stringAttribute(descriptor, kCTFontNameAttribute),
            styleName: stringAttribute(descriptor, kCTFontStyleNameAttribute)
        )
    }
    return InspectedFont(
        fileName: url.lastPathComponent,
        path: url.path,
        sha256: checksum,
        descriptors: descriptors
    )
}

let arguments = Array(CommandLine.arguments.dropFirst())
guard !arguments.isEmpty else {
    FileHandle.standardError.write(Data("Usage: inspect-fonts.swift <font.otf|font.ttf> [...]\n".utf8))
    exit(2)
}

do {
    let results = try arguments.map(inspect)
    let encoder = JSONEncoder()
    encoder.outputFormatting = [.prettyPrinted, .sortedKeys, .withoutEscapingSlashes]
    let output = try encoder.encode(results)
    FileHandle.standardOutput.write(output)
    FileHandle.standardOutput.write(Data("\n".utf8))
} catch {
    FileHandle.standardError.write(Data("FONT_INSPECTION_FAILED: \(error.localizedDescription)\n".utf8))
    exit(1)
}
