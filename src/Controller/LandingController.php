<?php

namespace App\Controller;

use App\Security\KeycloakUser;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\User\UserInterface;

class LandingController extends AbstractController
{
    public function __construct(
        #[Autowire('%app.landing_links%')]
        private readonly array $landingLinks,
        #[Autowire('%app.landing_header%')]
        private readonly array $landingHeader,
        #[Autowire('%env(CHAT_SERVER_URL)%')]
        private readonly string $chatServerUrl,
    ) {
    }

    #[Route('/', name: 'app_landing', methods: ['GET'])]
    public function __invoke(): Response
    {
        $user = $this->getUser();

        return $this->render('landing/index.html.twig', [
            'header' => $this->landingHeader,
            'links' => $this->landingLinks,
            'user' => $user,
            'personalGreeting' => $this->buildPersonalGreeting($user),
            'chatServerUrl' => rtrim($this->chatServerUrl, '/'),
            'chatUser' => $this->buildChatUser($user),
        ]);
    }

    private function buildPersonalGreeting(?UserInterface $user): string
    {
        $hour = (int) (new \DateTimeImmutable())->format('G');
        $salutation = match (true) {
            $hour >= 5 && $hour < 12 => 'Guten Morgen',
            $hour >= 12 && $hour < 18 => 'Guten Tag',
            $hour >= 18 && $hour < 22 => 'Guten Abend',
            default => 'Hallo',
        };

        $name = match (true) {
            $user instanceof KeycloakUser && '' !== trim($user->getDisplayName()) => $user->getDisplayName(),
            $user instanceof UserInterface => $user->getUserIdentifier(),
            default => 'schön, dass du da bist',
        };

        return sprintf('%s, %s!', $salutation, $name);
    }

    /**
     * @return array{userId:string,name:string,email:string}
     */
    private function buildChatUser(?UserInterface $user): array
    {
        if (!$user instanceof UserInterface) {
            return [
                'userId' => 'anonymous',
                'name' => 'Unbekannt',
                'email' => '',
            ];
        }

        $name = $user instanceof KeycloakUser && '' !== trim($user->getDisplayName())
            ? $user->getDisplayName()
            : $user->getUserIdentifier();

        return [
            'userId' => $user->getUserIdentifier(),
            'name' => $name,
            'email' => $user instanceof KeycloakUser ? $user->getEmail() : '',
        ];
    }
}
