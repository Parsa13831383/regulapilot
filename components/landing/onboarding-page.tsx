'use client';

import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, ArrowRight, Mail, Key, AlertCircle, BookOpen } from 'lucide-react';

interface OnboardingPageProps {
  onBack: () => void;
  onGetAccess: () => void;
}

const steps = [
  {
    number: '01',
    icon: BookOpen,
    title: 'What RegulaPilot Does',
    body: (
      <p className="text-muted-foreground leading-relaxed">
        RegulaPilot reads regulatory documents — FCA guidance, AML/KYC policies, internal compliance
        frameworks — and returns a structured breakdown of obligations, risk flags, and recommended
        actions. All output is traceable back to the source text.
      </p>
    ),
  },
  {
    number: '02',
    icon: Mail,
    title: 'Requesting an Invitation Code',
    body: (
      <div className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          Access is invite-only during the private beta. To request a code, send an email to:
        </p>
        <a
          href="mailto:qudo1383@gmail.com?subject=RegulaPilot%20Access%20Request"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Mail className="h-4 w-4 text-primary" />
          qudo1383@gmail.com
        </a>
        <p className="text-sm text-muted-foreground">
          Include your name and the team or organisation you work with. You will receive a reply
          with a single-use code within 1–2 business days.
        </p>
      </div>
    ),
  },
  {
    number: '03',
    icon: Key,
    title: 'Using Your Code',
    body: (
      <p className="text-muted-foreground leading-relaxed">
        Once you have a code, click <span className="font-medium text-foreground">Try Demo</span> on
        the home page and enter it in the access field. Each code is tied to a fixed number of
        analysis runs. You can see your remaining runs at any time in the top bar of the dashboard.
      </p>
    ),
  },
  {
    number: '04',
    icon: AlertCircle,
    title: 'Current Limitations',
    body: (
      <ul className="space-y-2">
        {[
          'Each invitation code grants a limited number of document analyses.',
          'Codes are non-transferable and expire after use.',
          'Only English-language documents are supported at this time.',
          'Output is AI-generated and should be reviewed by a qualified compliance professional before acting on it.',
          'Features are subject to change during the beta period.',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
];

export function OnboardingPage({ onBack, onGetAccess }: OnboardingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">RegulaPilot</span>
          </div>
          <div className="w-16" />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        {/* Header */}
        <div className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            Getting Started
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            How RegulaPilot Works
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            Everything you need to know before you begin — from requesting access to understanding
            what the tool can and cannot do.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12">
          {steps.map(({ number, icon: Icon, title, body }) => (
            <div key={number} className="flex gap-8">
              {/* Step number + connector */}
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/50">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-3 w-px flex-1 bg-border" />
              </div>

              {/* Content */}
              <div className="pb-12 pt-1.5">
                <div className="mb-1 text-xs font-medium text-muted-foreground">{number}</div>
                <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>
                {body}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-8">
          <h3 className="mb-2 text-base font-semibold text-foreground">Ready to get access?</h3>
          <p className="mb-6 text-sm text-muted-foreground">
            Request an invitation code and you can be up and running in minutes.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="default"
              onClick={onGetAccess}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Enter Access Code
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="default" variant="outline" asChild>
              <a href="mailto:qudo1383@gmail.com?subject=RegulaPilot%20Access%20Request">
                <Mail className="mr-2 h-4 w-4" />
                Request Invitation
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
