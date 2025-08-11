//
//  ContentView.swift
//  OpenScoreWatch Watch App
//
//  Created by Nicholas Johnson on 7/21/25.
//

import SwiftUI

struct ContentView: View {
  let viewModel = ViewModel()
    var body: some View {
        VStack {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundStyle(.tint)
            Text("Hello, world!")
            Button("SEND", action: {
              viewModel.sendMessage(
            })
        }
        .padding()
    }
}

#Preview {
    ContentView()
}
