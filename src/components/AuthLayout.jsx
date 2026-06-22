import React from "react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 max-w-lg mx-auto bg-background relative">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <img
            src="https://media.base44.com/images/public/6a2370f9e6d0e6ce0d081a52/5bd4ffbb9_QjhED.jpg"
            alt="FUTAMART"
            className="w-24 h-24 object-contain mx-auto mb-2 rounded-2xl"
          />
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl glass-orange glow-orange mt-4 mb-3">
            <Icon className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
        </div>
        <div className="glass rounded-2xl p-6">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}
