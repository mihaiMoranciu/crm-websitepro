import type { Metadata } from 'next'
import React from 'react'
import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Code,
  Container,
  Flex,
  Grid,
  Heading,
  Separator,
  Text,
  TextField,
} from '@radix-ui/themes'

import { BRAND, GRAY, HIGHLIGHT } from '@/design/theme'

/**
 * Internal style guide: every token and the core components, side by side, in
 * whichever appearance the visitor has picked. The place to judge a palette or
 * a font before it spreads across the site. Not indexed, not in the sitemap.
 */
export const metadata: Metadata = {
  title: 'Design',
  robots: { index: false, follow: false },
}

const STEPS = Array.from({ length: 12 }, (_, i) => i + 1)

const ROLES: Record<number, string> = {
  1: 'fundal',
  3: 'umplere',
  6: 'bordură',
  9: 'solid',
  11: 'text',
  12: 'text tare',
}

function Scale({ label, prefix }: { label: string; prefix: string }) {
  return (
    <Box>
      <Text as="p" size="2" weight="medium" mb="2">
        {label}
      </Text>
      <Grid columns="12" gap="1">
        {STEPS.map((step) => (
          <Flex key={step} direction="column" gap="1">
            <Box
              style={{
                background: `var(--${prefix}-${step})`,
                height: 48,
                borderRadius: 'var(--radius-2)',
                boxShadow: 'inset 0 0 0 1px var(--gray-a4)',
              }}
            />
            <Text size="1" color="gray">
              {step}
            </Text>
            {ROLES[step] ? (
              <Text size="1" color="gray" style={{ lineHeight: 1.1 }}>
                {ROLES[step]}
              </Text>
            ) : null}
          </Flex>
        ))}
      </Grid>
    </Box>
  )
}

export default function DesignPage() {
  return (
    <Container size="3" px="5" py="9">
      <Flex direction="column" gap="9">
        <Box>
          <Text size="2" color="gray">
            Intern
          </Text>
          <Heading size="8" mt="1">
            Sistemul de design
          </Heading>
          <Text as="p" size="3" color="gray" mt="2" style={{ maxWidth: 'var(--reading-width)' }}>
            Culorile, fontul și componentele de bază, configurate în <Code>src/design</Code>.
            Schimbă tema din subsol ca să vezi și varianta întunecată.
          </Text>
        </Box>

        <Flex direction="column" gap="5">
          <Heading size="5">Culori</Heading>
          <Scale label={`Brand: ${BRAND}`} prefix="accent" />
          <Scale label={`Partener: ${HIGHLIGHT}`} prefix="highlight" />
          <Scale label={`Gri: ${GRAY}`} prefix="gray" />
        </Flex>

        <Separator size="4" />

        <Flex direction="column" gap="4">
          <Heading size="5">Tipografie: IBM Plex Sans</Heading>
          <Heading size="9">Site-uri care funcționează</Heading>
          <Heading size="7">Dezvoltare web și aplicații</Heading>
          <Heading size="5">Proiectăm, construim și întreținem</Heading>
          <Text as="p" size="4" style={{ maxWidth: 'var(--reading-width)' }}>
            Textul de paragraf trebuie să se citească ușor pe ecrane lungi. Diacriticele românești
            se afișează corect: ș, ț, ă, î, â, Ș, Ț, Ă, Î, Â.
          </Text>
          <Text as="p" size="2" color="gray" style={{ maxWidth: 'var(--reading-width)' }}>
            Text secundar, pentru detalii și explicații care nu trebuie să atragă atenția.
          </Text>
          <Text size="2">
            <Code>const proiect = await payload.findByID()</Code> (IBM Plex Mono)
          </Text>
        </Flex>

        <Separator size="4" />

        <Flex direction="column" gap="4">
          <Heading size="5">Butoane</Heading>
          <Flex gap="3" wrap="wrap" align="center">
            <Button size="3">Cere o ofertă</Button>
            <Button size="3" variant="soft">
              Vezi proiectele
            </Button>
            <Button size="3" variant="outline">
              Contact
            </Button>
            <Button size="3" variant="ghost">
              Află mai mult
            </Button>
          </Flex>
          <Flex gap="3" wrap="wrap" align="center">
            <Button size="3" color={HIGHLIGHT}>
              Partener solid
            </Button>
            <Button size="3" variant="soft" color={HIGHLIGHT}>
              Partener soft
            </Button>
            <Button size="3" variant="soft" color="gray">
              Neutru
            </Button>
          </Flex>
          <Flex gap="2" wrap="wrap">
            <Badge>Web</Badge>
            <Badge color={HIGHLIGHT}>Nou</Badge>
            <Badge color="gray">Aplicații</Badge>
            <Badge variant="solid">Disponibil</Badge>
          </Flex>
        </Flex>

        <Separator size="4" />

        <Flex direction="column" gap="4">
          <Heading size="5">Suprafețe</Heading>
          <Grid columns={{ initial: '1', sm: '3' }} gap="4">
            <Card size="2">
              <Badge mb="3">Web</Badge>
              <Heading size="4" mb="1">
                Site-uri de prezentare
              </Heading>
              <Text as="p" size="2" color="gray">
                Rapide, ușor de administrat, gândite pentru Google.
              </Text>
            </Card>
            <Card size="2">
              <Badge mb="3" color={HIGHLIGHT}>
                Aplicații
              </Badge>
              <Heading size="4" mb="1">
                Aplicații la comandă
              </Heading>
              <Text as="p" size="2" color="gray">
                CRM-uri, portaluri și instrumente interne.
              </Text>
            </Card>
            <Card size="2" variant="classic">
              <Badge mb="3" color="gray">
                Design
              </Badge>
              <Heading size="4" mb="1">
                Identitate și print
              </Heading>
              <Text as="p" size="2" color="gray">
                Logo, materiale tipărite, ghid de brand.
              </Text>
            </Card>
          </Grid>
          <Callout.Root>
            <Callout.Text>Un mesaj de informare, în culoarea brandului.</Callout.Text>
          </Callout.Root>
          <Callout.Root color={HIGHLIGHT}>
            <Callout.Text>Un accent rar, în culoarea partener.</Callout.Text>
          </Callout.Root>
          <Box style={{ maxWidth: 360 }}>
            <TextField.Root size="3" placeholder="adresa@firma.ro" />
          </Box>
        </Flex>
      </Flex>
    </Container>
  )
}
