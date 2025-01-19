import React from 'react';
import { FaExclamationTriangle, FaShieldAlt, FaUserLock, FaGavel } from 'react-icons/fa';

function Important() {
  return (
    <div className="min-h-screen bg-black pt-32 px-8 pb-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8">
          <div className="flex items-center space-x-3 mb-4">
            <FaExclamationTriangle className="text-red-500 w-8 h-8" />
            <h1 className="text-3xl font-bold text-white">Important Warnings</h1>
          </div>
          <p className="text-gray-300">Please read these important guidelines and warnings carefully</p>
        </div>

        <div className="grid gap-8">
          {/* Account Usage Guidelines */}
          <div className="bg-[#111] rounded-xl p-8 border border-purple-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <FaUserLock className="text-purple-500 w-6 h-6" />
              <h2 className="text-2xl font-bold text-white">Account Usage Guidelines</h2>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Always disable cloud save and remote play in steam and other services in settings
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                If disconnected, use offline mode or Big Picture mode steam only
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                For guarded accounts, wait until unguarded or use a new account steam only
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Posts will be updated with new accounts for the same game
              </li>
            </ul>
            <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg">
              <p className="text-yellow-200 text-sm">
                They are too many stuff on the website so I may not update everything because I'm solo working on it
              </p>
            </div>
          </div>

          {/* Technical Limitations */}
          <div className="bg-[#111] rounded-xl p-8 border border-purple-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <FaShieldAlt className="text-purple-500 w-6 h-6" />
              <h2 className="text-2xl font-bold text-white">Technical Limitations</h2>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Ubisoft, Rockstar, and EA games may have additional protections so they are kind hard
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Some games use Denuvo that may prevent access so try later to play
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Try again later or use a new account if you encounter issues
              </li>
            </ul>
          </div>

          {/* Account Security */}
          <div className="bg-[#111] rounded-xl p-8 border border-purple-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <FaUserLock className="text-purple-500 w-6 h-6" />
              <h2 className="text-2xl font-bold text-white">Account Security</h2>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Never share account credentials with others
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Do not attempt to change account passwords
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Report any issues immediately through proper channels
              </li>
            </ul>
          </div>

          {/* Legal Disclaimer */}
          <div className="bg-[#111] rounded-xl p-8 border border-purple-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <FaGavel className="text-purple-500 w-6 h-6" />
              <h2 className="text-2xl font-bold text-white">Legal Disclaimer</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>
                We are not responsible for any issues that arise from not following the provided instructions. 
                Users are responsible for following all guidelines and using the service appropriately. 
                Any attempt to bypass security measures or misuse accounts will result in immediate termination 
                of access and potential legal consequences.
              </p>
              <p>
                This website does not host, stream, or provide any movies, TV shows, or related content. 
                All media content accessible through this site is hosted by third-party platforms or services. 
                Any actions taken, whether legal or illegal, in relation to such content are the sole responsibility 
                of the individuals or entities hosting the content. We are not liable for any consequences arising 
                from the use of third-party links or services.
              </p>
              <p className="text-yellow-200">
                Please ensure you comply with all applicable laws and regulations when accessing or using external content.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Important;