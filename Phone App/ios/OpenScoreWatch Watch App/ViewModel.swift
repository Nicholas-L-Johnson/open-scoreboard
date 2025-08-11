//
//  ViewModel.swift
//  OpenScoreWatch Watch App
//
//  Created by Nicholas Johnson on 7/21/25.
//

import Foundation
import CoreMotion
import WatchConnectivity
class ViewModel: NSObject, WCSessionDelegate {
  
  let manager = CMMotionManager()
  
  override init() {
    super.init()
    
    WCSession.default.delegate = self
    WCSession.default.activate()
  }
  
  func sendMessage() {
    if manager.isAccelerometerAvailable {
      manager.accelerometerUpdateInterval = 0.1
      
      manager.startAccelerometerUpdates(to: .main, withHandler: {data, other in
        let x = data?.acceleration.x ?? 0
        let y = data?.acceleration.y ?? 0
        
        WCSession.default.sendMessage([
          "x": "\(x)",
          "y": "\(y)"
        ], replyHandler: { _ in
          print("hello")
        })
      })
    }
  }

  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: (any Error)?) {}
}
