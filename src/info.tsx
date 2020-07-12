import React from 'react'
import { Platform, MessageDeletionMode, Attribute } from '@textshq/platform-sdk'

const info: Platform = {
  name: 'whatsapp-baileys',
  version: '0.2.0',
  displayName: 'WhatsApp',
  icon: (props: any) => (
    <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M1.744 3.5113C1.47365 4.02189 1.35842 4.58067 1.30351 5.23134C1.24999 5.86557 1.24999 6.65173 1.25 7.63627L1.25 7.67V8.33L1.25 8.36373C1.24999 9.34827 1.24999 10.1344 1.30351 10.7687C1.35842 11.4193 1.47365 11.9781 1.744 12.4887C2.14265 13.2416 2.75838 13.8574 3.5113 14.256C4.02189 14.5263 4.58067 14.6416 5.23134 14.6965C5.86557 14.75 6.65172 14.75 7.63625 14.75H7.67H8.33H8.36375C9.34828 14.75 10.1344 14.75 10.7687 14.6965C11.4193 14.6416 11.9781 14.5263 12.4887 14.256C13.2416 13.8574 13.8574 13.2416 14.256 12.4887C14.5263 11.9781 14.6416 11.4193 14.6965 10.7687C14.75 10.1344 14.75 9.34828 14.75 8.36375V8.33V7.67V7.63625C14.75 6.65172 14.75 5.86557 14.6965 5.23134C14.6416 4.58067 14.5263 4.02189 14.256 3.5113C13.8574 2.75838 13.2416 2.14265 12.4887 1.744C11.9781 1.47365 11.4193 1.35842 10.7687 1.30351C10.1344 1.24999 9.34827 1.24999 8.36373 1.25L8.33 1.25H7.67L7.63627 1.25C6.65173 1.24999 5.86557 1.24999 5.23134 1.30351C4.58067 1.35842 4.02189 1.47365 3.5113 1.744C2.75838 2.14265 2.14265 2.75838 1.744 3.5113Z" fill="#48C95F" />
      <path fillRule="evenodd" clipRule="evenodd" d="M8.01675 11.9694H8.0151C7.34845 11.9692 6.69339 11.8019 6.11159 11.4846L4 12.0385L4.5651 9.97439C4.21652 9.37029 4.0331 8.68506 4.0334 7.98302C4.03427 5.7868 5.82117 4 8.01671 4C9.08228 4.00046 10.0824 4.41528 10.8344 5.16821C11.5865 5.92109 12.0004 6.92186 12 7.98616C11.9991 10.1819 10.2129 11.9685 8.01675 11.9694ZM6.20933 10.7635L6.33022 10.8352C6.83854 11.1369 7.42122 11.2965 8.0153 11.2967H8.01664C9.84143 11.2967 11.3266 9.81147 11.3273 7.98594C11.3277 7.1013 10.9836 6.2695 10.3586 5.6437C9.7335 5.0179 8.90225 4.6731 8.01795 4.67279C6.19176 4.67279 4.70655 6.15786 4.70583 7.98326C4.70557 8.60883 4.8806 9.21807 5.21202 9.74518L5.29073 9.87045L4.95628 11.0922L6.20933 10.7635ZM9.88728 8.84376C9.9567 8.87731 10.0036 8.89996 10.0236 8.93337C10.0485 8.97487 10.0485 9.17415 9.96557 9.40667C9.8826 9.63915 9.48498 9.85134 9.29374 9.8799C9.12228 9.90554 8.90528 9.91623 8.66687 9.84046C8.52231 9.7946 8.33693 9.73336 8.09947 9.63081C7.16641 9.22792 6.53585 8.32358 6.41668 8.15266C6.40833 8.14069 6.40249 8.13231 6.39924 8.12796L6.39843 8.12689C6.34576 8.05662 5.99284 7.58573 5.99284 7.09838C5.99284 6.63992 6.21804 6.39962 6.3217 6.28901C6.3288 6.28144 6.33533 6.27447 6.34118 6.26808C6.43241 6.16844 6.54024 6.14352 6.60659 6.14352C6.67293 6.14352 6.73935 6.14414 6.79734 6.14705C6.8045 6.14741 6.81194 6.14737 6.81964 6.14732C6.87763 6.14698 6.94994 6.14656 7.02128 6.3179C7.04872 6.38384 7.08888 6.4816 7.13123 6.58471C7.21687 6.79321 7.31149 7.02357 7.32814 7.05691C7.35303 7.10673 7.36961 7.16483 7.33644 7.23129C7.33146 7.24125 7.32685 7.25065 7.32245 7.25964C7.29753 7.31051 7.2792 7.34793 7.23691 7.39731C7.22028 7.41673 7.20309 7.43766 7.18591 7.45859C7.15167 7.50029 7.11743 7.54198 7.08762 7.57169C7.03779 7.62132 6.98592 7.67516 7.04398 7.7748C7.10204 7.87445 7.30178 8.20036 7.59766 8.46428C7.91572 8.74798 8.19216 8.86788 8.33227 8.92866C8.35964 8.94053 8.3818 8.95014 8.39806 8.95828C8.49755 9.00812 8.55561 8.99978 8.61367 8.93337C8.67173 8.86695 8.86248 8.64274 8.92881 8.54311C8.99515 8.44351 9.06153 8.4601 9.15274 8.4933C9.244 8.52655 9.73332 8.7673 9.83285 8.81711C9.85228 8.82684 9.87044 8.83562 9.88728 8.84376Z" fill="#FDFDFD" />
    </svg>
  ),
  loginMode: 'custom',
  browserLogin: null,
  supportedReactions: [],
  deletionMode: MessageDeletionMode.DELETE_FOR_EVERYONE,
  maxGroupTitleLength: 25,
  typingDurationMs: 1000,
  attributes: new Set([
    Attribute.SUPPORTS_ARCHIVE,
    Attribute.SUPPORTS_PIN_THREAD,
    Attribute.SUPPORTS_QUOTED_MESSAGES,
    Attribute.SUPPORTS_SEARCH,
  ]),
  getUserLink: p => p.id,
}

export default info
