import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaExclamationTriangle, FaShieldAlt, FaGamepad, 
  FaServer, FaLock, FaInfoCircle, FaCopyright, FaHandPaper,
  FaGlobeAmericas, FaDatabase, FaFileContract, FaBalanceScale,
  FaUnlink, FaBan, FaExclamationCircle, FaSteam,
  FaDesktop, FaCog, FaShieldVirus, FaVideo, FaFilm, FaTv,
  FaPlayCircle, FaGlobe, FaUserSecret, FaLaptop, FaKey,
  FaUserLock, FaUserShield, FaUserTimes, FaUserCog, FaTools,
  FaExchangeAlt, FaHistory, FaNetworkWired, FaShieldAlt as FaShieldAlt2,
  FaUserAlt, FaLockOpen, FaEye, FaEyeSlash, FaGavel, FaUserTie, FaHandshake,
  FaCheckCircle, FaLink, FaShieldVirus as FaShieldVirus2, FaGlobeAmericas as FaGlobeAmericas2
} from 'react-icons/fa';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

function Important() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative h-[50vh]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/50 to-black" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 pb-16 px-12">
          <div className="max-w-4xl space-y-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-red-500/20 backdrop-blur-sm rounded-full text-red-400 text-xs font-medium">
                  CRITICAL INFORMATION
                </span>
              </div>
              <h1 className="text-5xl font-bold text-white tracking-tight">Legal Disclaimers & Important Notices</h1>
            </div>
            <p className="text-lg text-white/90 leading-relaxed max-w-xl">
              Please read these important guidelines, disclaimers, and legal notices carefully before using our services. If users do not read this information, they may face account termination. We are not responsible if you did not read the provided information.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-12 pb-16">
        <motion.div 
          className="max-w-7xl mx-auto space-y-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Official Website Notice */}
          <motion.div variants={item} className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-8 border border-green-500/20">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <FaCheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Official Website Notice</h2>
                <p className="text-green-400">Important information about official sources</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                <p className="text-white font-semibold mb-2">Official Source Warning:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-2">
                  <li>This is the ONLY official website for our services</li>
                  <li>Do not trust any other websites claiming to be us</li>
                  <li>We do not have any alternative or mirror websites</li>
                  <li>Beware of impersonators and fake websites</li>
                  <li>We are not affiliated with any other similar services</li>
                  <li>Report any websites pretending to be us</li>
                  <li>We do not operate on any other domains</li>
                  <li>All official communications come through this website only</li>
                  <li>We do not have any official social media accounts</li>
                  <li>Never enter your credentials on other websites</li>
                  <li>We are not responsible for losses on fake websites</li>
                  <li>Always verify you are on the correct domain</li>
                  <li>Do not trust third-party websites offering our services</li>
                  <li>We do not partner with other similar services</li>
                  <li>Report suspicious websites to our staff team</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Additional Security Warning */}
          <motion.div variants={item} className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl p-8 border border-orange-500/20">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <FaShieldVirus2 className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Additional Security Warnings</h2>
                <p className="text-orange-400">Critical security information for users</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Never share your login credentials with anyone</li>
                  <li>Do not use the same password across multiple services</li>
                  <li>We will never ask for your personal information</li>
                  <li>Beware of phishing attempts and scams</li>
                  <li>Do not download any unauthorized software</li>
                  <li>We do not offer any mobile applications</li>
                  <li>Never pay anyone claiming to be our staff</li>
                  <li>Report suspicious activities immediately</li>
                  <li>Do not trust unofficial Discord/Telegram groups</li>
                  <li>We do not offer account recovery services</li>
                  <li>Never enter sensitive information on other sites</li>
                  <li>We do not have any browser extensions</li>
                  <li>Beware of fake account generators</li>
                  <li>Do not trust unofficial support channels</li>
                  <li>We never request remote access to your device</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Account Usage Disclaimer */}
          <motion.div variants={item} className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-xl p-8 border border-yellow-500/20">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <FaUserLock className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Account Usage Disclaimer</h2>
                <p className="text-yellow-400">Important information about account access and responsibility</p>
              </div>
            </div>
            <div className="space-y-4 text-gray-300">
              <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                <p className="text-white font-semibold mb-2">Account Responsibility Notice:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>We are not responsible for any account suspensions, bans, guard, 2fa, or locks</li>
                  <li>Users are solely responsible for proper account usage</li>
                  <li>No guarantee is provided for account longevity or availability</li>
                  <li>Accounts may be terminated by service providers at any time by users</li>
                  <li>Account credentials are shared at user's own risk</li>
                  <li>Users should not modify account username, mail, passwords, any other infos</li>
                  <li>Multiple simultaneous logins may trigger security measures</li>
                  <li>Some accounts may have regional or device restrictions</li>
                  <li>We do not guarantee account availability after posting</li>
                  <li>Users may change or lock accounts without notice</li>
                  <li>Account access may be revoked by original owners</li>
                  <li>No refunds for account issues or terminations</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Account Security Guidelines */}
          <motion.div variants={item} className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl p-8 border border-purple-500/20">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <FaUserShield className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Account Security Guidelines</h2>
                <p className="text-purple-400">Best practices for account usage</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Do not change account passwords or security settings</li>
                  <li>Avoid simultaneous logins from multiple devices</li>
                  <li>Do not share account credentials with others</li>
                  <li>Log out after each session</li>
                  <li>Do not add personal payment methods</li>
                  <li>Do not link personal emails or phone numbers</li>
                  <li>Use provided credentials exactly as given</li>
                  <li>Report non-working accounts through proper channels</li>
                  <li>Do not attempt to recover or reset accounts</li>
                  <li>Respect account region restrictions</li>
                  <li>Do not enable two-factor authentication</li>
                  <li>Do not add or modify security questions</li>
                  <li>Do not change account language settings</li>
                  <li>Do not modify account privacy settings</li>
                  <li>Do not link social media accounts</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Account Termination Notice */}
          <motion.div variants={item} className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-xl p-8 border border-red-500/20">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <FaUserTimes className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Account Termination Notice</h2>
                <p className="text-red-400">Understanding account limitations and risks</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                <p className="text-white font-semibold mb-2">Accounts may be terminated or suspended for:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Violation of service provider terms</li>
                  <li>Suspicious login activity</li>
                  <li>Multiple simultaneous users</li>
                  <li>Password changes or recovery attempts</li>
                  <li>Region violations</li>
                  <li>Payment method modifications</li>
                  <li>Security setting changes</li>
                  <li>Excessive downloads or usage</li>
                  <li>Profile modifications</li>
                  <li>Any form of account abuse</li>
                  <li>Enabling additional security features</li>
                  <li>Changing account email or phone</li>
                  <li>Adding unauthorized devices</li>
                  <li>Modifying account recovery options</li>
                  <li>Unauthorized profile changes</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Account Recovery and Support */}
          <motion.div variants={item} className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl p-8 border border-blue-500/20">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <FaTools className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Account Recovery and Support</h2>
                <p className="text-blue-400">Important information about account issues</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>We do not provide account recovery services</li>
                  <li>No support for password resets or changes</li>
                  <li>No assistance with account lockouts</li>
                  <li>No help with security verification</li>
                  <li>No support for payment issues</li>
                  <li>No assistance with region restrictions</li>
                  <li>No help with device authorization</li>
                  <li>No support for banned accounts</li>
                  <li>No assistance with account migrations</li>
                  <li>No help with profile transfers</li>
                  <li>Wait for new accounts</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Content Hosting Disclaimer */}
          <motion.div variants={item} className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-xl p-8 border border-red-500/20">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <FaServer className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Content Hosting Disclaimer</h2>
                <p className="text-red-400">Important information about content access and delivery</p>
              </div>
            </div>
            <div className="space-y-4 text-gray-300">
              <p className="p-4 bg-black/50 rounded-lg border border-white/10">
                This website does not host, store, or distribute any video content, movies, TV shows, or media files on its servers. All content is provided through external third-party services and streaming platforms.
              </p>
              <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                <p className="text-white font-semibold mb-2">We explicitly state that:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>All streaming links are provided by third-party services</li>
                  <li>We do not have control over external content sources</li>
                  <li>We do not upload or host any video files</li>
                  <li>We do not provide download capabilities for any content</li>
                  <li>Content availability and quality depend on external providers</li>
                  <li>We are not responsible for content removal requests</li>
                  <li>We do not verify the legality of external content sources</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Game Safety Instructions */}
          <motion.div variants={item} className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-xl p-8 border border-yellow-500/20">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <FaGamepad className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Game Safety Instructions</h2>
                <p className="text-yellow-400">Critical settings for safe game usage</p>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                <div className="flex items-start space-x-3">
                  <FaSteam className="w-5 h-5 text-yellow-400 mt-1" />
                  <div className="space-y-2">
                    <p className="text-white font-semibold">Steam Settings Configuration:</p>
                    <ul className="list-disc list-inside text-gray-300 space-y-1 ml-2">
                      <li>Disable Cloud Save Synchronization</li>
                      <li>Turn off Remote Play functionality</li>
                      <li>Use Offline Mode when possible</li>
                      <li>Consider using Big Picture Mode for better compatibility</li>
                      <li>Disable automatic updates</li>
                      <li>Log out from Steam after playing</li>
                      <li>If the game start whit an error it may be Digital rights management (DRM) or Denuvo use an new account or try later</li>
                      <li>Do not modify game files or save locations</li>
                      <li>Avoid using mods or third-party tools</li>
                      <li>Do not link other platforms or services</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Legal Compliance */}
          <motion.div variants={item} className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl p-8 border border-blue-500/20">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <FaBalanceScale className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Legal Compliance</h2>
                <p className="text-gray-400">Your responsibilities and obligations</p>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                <div className="flex items-start space-x-3">
                  <FaGlobeAmericas className="w-5 h-5 text-blue-400 mt-1" />
                  <div className="space-y-2">
                    <p className="text-gray-300">Users must comply with all applicable laws and regulations in their jurisdiction.</p>
                    <ul className="list-disc list-inside text-gray-400 space-y-1 ml-2">
                      <li>Copyright laws and intellectual property rights</li>
                      <li>Data protection and privacy regulations</li>
                      <li>Content distribution and streaming regulations</li>
                      <li>Age restrictions and content ratings</li>
                      <li>Local broadcasting and media laws</li>
                      <li>Digital rights management (DRM) restrictions</li>
                      <li>Terms of service of third-party platforms</li>
                      <li>Account sharing and usage policies</li>
                      <li>Content access restrictions</li>
                      <li>Regional licensing agreements</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Staff and Liability Disclaimer */}
          <motion.div variants={item} className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl p-8 border border-purple-500/20">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <FaUserTie className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Staff and Liability Disclaimer</h2>
                <p className="text-purple-400">Important information about staff responsibilities and legal liability</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                <p className="text-white font-semibold mb-2">Staff Team and Website Liability Notice:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-2">
                  <li>The staff team and website owners are not responsible for any actions taken by users</li>
                  <li>No legal action can be taken against the staff team or website for any reason</li>
                  <li>Users acknowledge they use this service entirely at their own risk</li>
                  <li>The staff team cannot be held liable for any account-related issues</li>
                  <li>No compensation will be provided for any type of loss or damage</li>
                  <li>Users waive all rights to legal claims against the staff or website</li>
                  <li>The staff team reserves the right to terminate any service without notice</li>
                  <li>No refunds or reimbursements will be provided under any circumstances</li>
                  <li>Users accept full responsibility for their actions and any consequences</li>
                  <li>The staff team is not obligated to provide support or assistance</li>
                  <li>Users agree to indemnify and hold harmless the staff and website</li>
                  <li>All services are provided "as is" without any warranties</li>
                  <li>The staff team's decisions are final and non-negotiable</li>
                  <li>Users must comply with all staff instructions and guidelines</li>
                  <li>The website may be terminated at any time without prior notice</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Legal Jurisdiction */}
          <motion.div variants={item} className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-xl p-8 border border-red-500/20">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <FaGavel className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Legal Jurisdiction and Enforcement</h2>
                <p className="text-red-400">Understanding legal boundaries and enforcement</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>This service operates under no specific legal jurisdiction</li>
                  <li>Users agree to waive all rights to legal proceedings</li>
                  <li>No court of law has authority over this service</li>
                  <li>Users cannot seek legal remedies for any issues</li>
                  <li>All interactions are considered informal and non-binding</li>
                  <li>No contract exists between users and staff</li>
                  <li>Users have no legal standing to challenge decisions</li>
                  <li>The service can be terminated without legal consequence</li>
                  <li>No liability exists for service interruptions</li>
                  <li>Users accept all risks without legal recourse</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Final Notice */}
          <motion.div variants={item} className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-xl p-8 border border-red-500/20">
            <div className="flex items-start space-x-4">
              <FaExclamationTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div className="space-y-4">
                <p className="text-white font-bold">By using this service, you acknowledge that:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>You have read and understood all disclaimers and notices</li>
                  <li>You accept full responsibility for your use of the service</li>
                  <li>You will not hold us liable for any damages or consequences</li>
                  <li>You have the legal right to access content in your region</li>
                  <li>You will comply with all applicable laws and regulations</li>
                  <li>We reserve the right to terminate access at any time</li>
                  <li>These terms may be updated without prior notice</li>
                  <li>You understand we do not host any content directly</li>
                  <li>You accept that content quality and availability may vary</li>
                  <li>You will not attempt to circumvent any restrictions</li>
                  <li>You understand accounts may be terminated without notice</li>
                  <li>You accept all risks associated with using shared accounts</li>
                  <li>You will not attempt to modify or recover accounts</li>
                  <li>You understand we are not responsible for account bans</li>
                  <li>You will not share or resell account credentials</li>
                  <li>You accept that accounts may be locked by other users</li>
                  <li>You understand we cannot guarantee account access</li>
                  <li>You accept the risk of losing access without warning</li>
                  <li>You will not attempt to contact account owners</li>
                  <li>You understand accounts may have usage limitations</li>
                  <li>You acknowledge this is the only official website</li>
                  <li>You will not use any unofficial or third-party services</li>
                  <li>You understand we may ban accounts without explanation</li>
                  <li>You accept that all actions are monitored</li>
                  <li>You will not attempt to bypass our security measures</li>
                </ul>
                <p className="text-red-400 font-semibold mt-4">
                  If you do not agree with any part of these terms, please discontinue use of the service immediately. Failure to comply with these terms will result in immediate account termination we have smart detectors that detect any bad actions againts the important infos.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Important;